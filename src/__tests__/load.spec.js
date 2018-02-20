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

  xit('should not abort when no transactions are used', async () => {
    const stats = await run()
    expect(stats).toEqual({
      aborts: 0,
      exists: 0,
    })

    const stats2 = await run()
    expect(stats2).toEqual({
      aborts: 0,
      exists: 100,
    })
  })
})

async function run () {
  const siteId = await createSite('Test Data')

  let counter = customers.length
  let aborts = 0
  let exists = 0

  return new Promise((resolve) => {
    /* eslint-disable */
    customers.forEach(async (customer, i) => {
      console.log(`Checking if customer ${customer.id} exitsts`)

      const custExists = await customerExists(siteId, customer.id)
      if (custExists) exists += 1

      console.log(`Customer ${customer.id} exists: ${custExists ? 'YES': 'NO'}`)

      const uid = await createCustomer(siteId, customer, i)
      .catch((e) => {
        console.log(customer.id, e.message)
        console.log(`Customer ${customer.id} aborted. Total aborts: ${aborts += 1}`)
      })

      if (uid) {
        console.log(`Created customer ${customer.id}: ${uid}`)
      }

      console.log('Remaining customers', counter -= 1)

      if (counter === 0) resolve({
        aborts,
        exists,
      })
    })
  })
}

async function customerExists (siteId, customerId) {
  const query = `
    query {
      root (func: uid(${siteId})) @filter(eq(customers.id, "${customerId}")) {
        uid
      }
    }
  `
  const resp = await dgraph.query(query)
  return !!(resp && resp.root && resp.root[0] && resp.root[0].uid)
}

async function createCustomer (siteId, customer, i) {
  const mutStr = mapObj(customer, (val, key) => `_:cust_${i} <customers.${key}> "${val}" .`)
    .concat([`
      <${siteId}> <site.customers> _:cust_${i} .
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
    site.customers: uid @reverse .
  `

  await dgraph.alter(siteSchema)

  return siteId
}
