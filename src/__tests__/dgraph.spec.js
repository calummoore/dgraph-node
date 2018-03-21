import DgraphClient from '../dgraph'

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

  it('should send a set JSON mutation', async () => {
    const resp = await client.mutate({ set: { uid: '_:jane', name: 'Jane' } })
    expect(resp.data).toHaveProperty('uids', {
      jane: expect.any(String),
    })

    // Check it has committed
    const query = await client.query(queryById(resp.data.uids.jane))
    expect(query).toMatchSnapshot()
  })

  it('should send a set using set command', async () => {
    const resp = await client.set({ uid: '_:peter', name: 'Peter' })
    expect(resp.data).toHaveProperty('uids', {
      peter: expect.any(String),
    })

    // Check it has committed
    const query = await client.query(queryById(resp.data.uids.peter))
    expect(query).toMatchSnapshot()
  })

  it('should send a del using set command', async () => {
    const resp = await client.set({ uid: '_:peter', name: 'Peter' })
    await client.del({ uid: resp.data.uids.peter })

    // Check it has committed
    const query = await client.query(queryById(resp.data.uids.peter))
    expect(query).toMatchSnapshot()
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
})
