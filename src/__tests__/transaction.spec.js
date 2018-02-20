import DgraphClient from '../dgraph'
import DgraphTransaction from '../transaction'

let client
let txn

const queryById = (id = '0xcceb', fields = 'name') => {
  return `
    query {
      q(func: uid(${id})) {
        ${fields}
      }
    }
  `
}
const createBob = () => txn.mutate({
  set: '<_:bob> <name> "Bob" .',
})

describe('Transactions', () => {
  beforeEach(async () => {
    client = new DgraphClient({ debug: true })
    await client.dropAll()
    txn = client.txn()
  })

  it('should return a Transaction instance', () => {
    expect(txn).toBeInstanceOf(DgraphTransaction)
  })

  it('should not show mutation before commit', async () => {
    const mutation = {
      set: '<_:bob> <name> "Bob" .',
    }
    const resp = await txn.mutate(mutation)
    const { bob } = resp.data.uids
    const findBob = await client.query(queryById(bob))
    expect(findBob.data.q).toEqual([])
  })

  it('should commit changes on commit', async () => {
    const resp = await createBob()
    const { bob } = resp.data.uids
    await txn.commit()
    const findBob = await client.query(queryById(bob))
    expect(findBob.data.q).toEqual([{ name: 'Bob' }])
  })

  it('should reject changes if mutation conflicts', async () => {
    const resp = await createBob()
    const { bob } = resp.data.uids
    const txn1 = client.txn()
    const txn2 = client.txn()
    await txn1.mutate({ set: `<${bob}> <name> "Bob1" .` })
    await txn2.mutate({ set: `<${bob}> <name> "Bob2" .` })
    await txn2.commit()
    await expect(txn1.commit()).rejects.toEqual(new Error('Transaction has been aborted. Please retry'))
    const findBob = await client.query(queryById(bob))
    expect(findBob.data.q).toEqual([{ name: 'Bob2' }])
  })
})
