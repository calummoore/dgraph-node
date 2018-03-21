import DgraphClient from '../dgraph'
import customers from './customers100.json'

const mapObj = (obj, fn) => {
  const keys = Object.keys(obj)
  return keys.map(key => fn(obj[key], key))
}

let dgraph

describe('Load test', () => {
  beforeEach(async () => {
    dgraph = new DgraphClient()
    await dgraph.dropAll()
  })

  it('should not abort when no transactions are used', async () => {
    const stats = await run()
    expect(stats).toMatchObject({
      aborts: 0,
      exists: 0,
    })

    const stats2 = await run(stats.siteId)
    expect(stats2).toEqual({
      siteId: stats.siteId,
      aborts: 0,
      exists: 100,
    })
  })
})

async function run (_siteId) {
  const siteId = _siteId || await createSite('Test Data')

  let counter = customers.length
  let aborts = 0
  let exists = 0

  return new Promise((resolve) => {
    /* eslint-disable */
    customers.forEach(async (customer, i) => {
      // console.log(`Checking if customer ${customer.id} exitsts`)

      const custExists = await customerExists(siteId, customer.id)
      if (custExists) exists += 1

      // console.log(`Customer ${customer.id} exists: ${custExists ? 'YES': 'NO'}`)

      const uid = await createCustomer(siteId, customer, i)
      .catch((e) => {
        aborts += 1
        // console.log(customer.id, e.message)
        // console.log(`Customer ${customer.id} aborted. Total aborts: ${aborts}`)
      })

      if (uid) {
        // console.log(`Created customer ${customer.id}: ${uid}`)
      }

      counter -= 1
      // console.log('Remaining customers', counter)

      if (counter === 0) resolve({
        siteId,
        aborts,
        exists,
      })
    })
  })
}

async function customerExists (siteId, customerId) {
  const query = `
    query {
      root (func: uid(${siteId})) @normalize {
        ~customers.site @filter(eq(customers.id, "${customerId}")) {
          id: uid
        }
      }
    }
  `
  const resp = await dgraph.query(query)
  const root = resp.data.root || []
  return !!(root[0] && root[0].id)
}

async function createCustomer (siteId, customer, i) {
  const mutStr = mapObj(customer, (val, key) => `_:cust_${i} <customers.${key}> "${val}" .`)
    .concat([`
      _:cust_${i} <customers.site> <${siteId}> .
      _:cust_${i} <node.type> "customers" .
    `])
    .join('\n')

  const resp = await dgraph.mutate({
    set: mutStr,
  })

  return resp.data.uids[`cust_${i}`]
}

async function createSite (name) {
  const mut = `
    <_:site> <site.name> "${name}" .
  `

  const resp = await dgraph.mutate({
    set: mut,
  })

  const siteId = resp.data.uids.site

  const siteSchema = `
    customers.id: float @index(float) .
    customers.first_name: string @index(trigram) .
    customers.last_name: string @index(trigram) .
    customers.email: string @index(exact) .
    customers.gender: string @index(exact) .
    customers.site: uid @reverse .
  `

  await dgraph.alter(siteSchema)

  return siteId
}
