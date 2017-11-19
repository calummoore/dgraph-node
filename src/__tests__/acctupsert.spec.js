// Ported from:
// https://github.com/dgraph-io/dgraph/tree/master/contrib/integration/acctupsert

import DgraphClient from '../dgraph'

const maxAttempts = 50
const firsts = ['Paul', 'Eric', 'Jack', 'John', 'Martin']
const lasts = ['Brown', 'Smith', 'Robinson', 'Waters', 'Taylor']
const ages = [20, 25, 30, 35]
const accounts = []
const wait = time => new Promise(resolve => setTimeout(resolve, time))

firsts.forEach(first => lasts.forEach(last => ages.forEach(age => accounts.push({
  first, last, age,
}))))

const schema = `
  first:  string   @index(term) .
  last:   string   @index(hash) .
  age:    int      @index(int)  .
  when:   int                   .
`
let client

async function upsert (account, counter = 0) {
  // console.log(`${account.first}, ${account.last}: ${counter} `)
  try {
    await tryUpsert(account)
    console.log(`Success for ${account.first}_${account.last}_${account.age} after ${counter} attemps`)
  } catch (err) {
    expect(err.toString()).toMatch(/conflict|aborted/)
    if (counter + 1 >= maxAttempts) {
      throw new Error(`Account upsert for
          ${account.first}, ${account.last}, ${account.age}
        failed after ${counter + 1} attempts`)
    }
    await wait(50 + (Math.random() * 100))
    await upsert(account, counter + 1)
  }
  return true
}

async function tryUpsert (account) {
  const txn = client.txn()

  const { first, last, age } = account
  const query = `{
    get(func: eq(first, "${first}")) @filter(eq(last, "${last}") AND eq(age, "${age}")) {
      uid
    }
  }`

  const resp = await txn.query(query)
  const { get } = resp.data
  let uid = get[0] && get[0].uid

  expect(get.length).toBeLessThanOrEqual(1)

  if (get.length === 1) {
    expect(uid).toBe(expect.any(String))
  } else {
    const mut = await txn.mutate({
      set: `
      _:acct <first> "${first}" .
      _:acct <last>  "${last}" .
      _:acct <age>   "${age}"^^<xs:int> .`,
    })
    uid = mut.data.uids.acct
    expect(uid).not.toBeUndefined()
  }

  await txn.mutate({
    set: `<${uid}> <when> "${+(new Date())}"^^<xs:int> .`,
  })

  return txn.commit()
}

xdescribe('acctupsert', () => {
  beforeEach(async () => {
    client = new DgraphClient()
    await client.dropAll()
    await client.alter(schema)
  })

  it('should successfully perform upsert load test', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

    const promises = []
    accounts.forEach((account) => {
      promises.push(upsert(account))
    })

    await Promise.all(promises).catch((err) => {
      throw new Error(err)
    })

    const query = `{
      all(func: anyofterms(first, "${firsts.join(' ')}")) {
        first
        last
        age
      }
    }`

    const resp = await client.query(query)

    const { all } = resp.data
    const check = {}
    expect(all).toHaveLength(100)
    all.forEach(({ first, last, age }) => {
      check[`${first}_${last}_${age}`] = true
    })
    accounts.forEach(({ first, last, age }) => {
      if (!check[`${first}_${last}_${age}`]) {
        throw new Error(`Account ${first}_${last}_${age} is missing!`)
      }
    })
  })
})
