import DgraphClient from '../dgraph'
import { mergeMax } from '../util'

let client
const queryById = (id = '0xcceb', fields = 'name') => {
  return `
    query {
      q(func: uid(${id})) {
        ${fields}
      }
    }
  `
}
const createBob = () => client.mutate({
  set: '<_:bob> <name> "Bob" .',
})

describe('dgraph', () => {
  beforeEach(async () => {
    client = new DgraphClient()
    await client.dropAll()
  })

  it('should send query', async () => {
    const query = queryById()
    const resp = await client.query(query)
    expect(resp.data).toMatchSnapshot()
  })

  it('should send a set mutation', async () => {
    const resp = await createBob()
    expect(resp.data).toHaveProperty('uids', {
      bob: expect.any(String),
    })
  })

  it('should commit mutation', async () => {
    const resp = await createBob()
    const { bob } = resp.data.uids
    const query = await client.query(queryById(bob))
    expect(query.data.q[0]).toEqual({
      name: 'Bob',
    })
  })

  it('should commit mutation with index', async () => {
    const resp = await client.mutate({
      set: '<_:bob> <name> "Bob" .',
    }, true, undefined, true)
    const { bob } = resp.data.uids
    const query = await client.query(queryById(bob))
    expect(query.data.q[0]).toEqual({
      name: 'Bob',
    })
  })

  it('should drop the DB', async () => {
    const resp = await createBob()
    await client.dropAll()
    const { bob } = resp.data.uids
    const query = await client.query(queryById(bob))
    expect(query.data.q).toEqual([])
  })

  it('should perform delete mutation', async () => {
    const resp = await createBob()
    const { bob } = resp.data.uids
    await client.mutate({
      del: `<${bob}> * * .`,
    })
    const query = await client.query(queryById(bob))
    expect(query.data.q).toEqual([])
  })

  it('should alter the schema', async () => {
    await createBob()
    await client.alter('name: string @index(exact, term) .')
    const queryByTerm = `query {
        q(func: allofterms(name, "Bob")) {
          name
        }
      }
    `
    const query = await client.query(queryByTerm)
    expect(query.data.q[0]).toEqual({
      name: 'Bob',
    })
  })

  it('should send lin_read after the first query', async () => {
    expect(client.linRead).toBeNull()
    const resp = await client.query(queryById())
    const linReadIds = mergeMax(null, resp.context.lin_read.ids)
    expect(client.linRead).toEqual(linReadIds)
    client._query = jest.fn(client._query)
    await client.query(queryById())
    expect(client._query).toHaveBeenCalled()
    expect(client._query.mock.calls[0][0].lin_read.ids).toEqual(linReadIds)
  })
})
