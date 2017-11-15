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
    client = new DgraphClient()
    await client.dropAll()
    txn = client.txn()
  })

  it('should return a Transaction instance', () => {
    expect(txn).toBeInstanceOf(DgraphTransaction)
  })

  describe('Managing context', () => {
    it('should set startTs initially to null', () => {
      expect(txn.startTs).toBeNull()
    })

    it('should set startTs on the first query', async () => {
      const resp = await txn.query(queryById())
      expect(txn.startTs).toEqual(resp.context.start_ts)
      expect(txn.startTs).toEqual(expect.any(String))
    })

    it('should set startTS on the first mutation', async () => {
      const resp = await createBob()
      expect(txn.startTs).toEqual(resp.context.start_ts)
      expect(txn.startTs).toEqual(expect.any(String))
    })

    it('should not set startTs after first query', async () => {
      const resp = await createBob()
      const resp2 = await createBob()
      expect(resp.context.start_ts).toEqual(resp2.context.start_ts)
    })

    it('should send startTs on mutations after first request', async () => {
      await txn.query(queryById())
      client.mutate = jest.fn(client.mutate)
      const { startTs } = txn
      await createBob()
      expect(client.mutate).toHaveBeenCalledWith(expect.any(Object), false, startTs)
    })

    it('should store the keys from a mutation', async () => {
      const resp = await createBob()
      const { keys } = resp.context
      expect(txn.keys).toEqual(keys)
      expect(txn.keys).toEqual(expect.any(Array))
      expect(txn.keys.length).toBeGreaterThan(0)
    })
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
    const commit = await txn.commit()
    const findBob = await client.query(queryById(bob))
    expect(findBob.data.q).toEqual([{ name: 'Bob' }])
    expect(commit).toMatchObject({ aborted: false })
  })

  it('should include context in commit', async () => {
    const resp = await createBob()
    const { keys, start_ts } = resp.context
    client._commitOrAbort = jest.fn(client._commitOrAbort)
    await txn.commit()
    expect(client._commitOrAbort.mock.calls[0][0]).toMatchObject({
      keys,
      start_ts,
    })
  })

  it('should reject changes if mutation conflicts', async () => {
    const resp = await createBob()
    const { bob } = resp.data.uids
    const txn1 = client.txn()
    const txn2 = client.txn()
    await txn1.mutate({ set: `<${bob}> <name> "Bob1" .` })
    await txn2.mutate({ set: `<${bob}> <name> "Bob2" .` })
    const commit2 = await txn2.commit()
    const commit1 = txn1.commit()
    expect(commit2).toMatchObject({ aborted: false })
    expect(commit1).rejects.toEqual(new Error('Transaction aborted'))
    const findBob = await client.query(queryById(bob))
    expect(findBob.data.q).toEqual([{ name: 'Bob2' }])
  })
})
