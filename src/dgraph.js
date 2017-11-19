import grpc from 'grpc'
import promisify from 'es6-promisify'
import protos from './protos'
import Transaction from './transaction'
import { mergeMax } from './util'
import { createLinRead } from './convert'

export default class DgraphClient {
  constructor (userConfig) {
    const config = {
      url: 'localhost:9080',
      debug: false,
      ...userConfig,
    }

    // Create gprc client into Dgraph
    const d = new protos.Dgraph(
      config.url,
      config.credentials || grpc.credentials.createInsecure(),
    )

    // Promisfy the proto fns
    this._mutate = promisify(d.mutate, d)
    this._query = promisify(d.query, d)
    this._alter = promisify(d.alter, d)
    this._commitOrAbort = promisify(d.commitOrAbort, d)

    this.linRead = null
    this.config = config
  }

  async query (query, linRead) {
    const queryRequest = new protos.Request()
    queryRequest.query = query
    if (linRead || this.linRead) queryRequest.lin_read = createLinRead(linRead || this.linRead)
    if (this.config.debug) console.log(`Query request: \n${JSON.stringify(query, null, '  ')}`)
    const resp = await this._query(queryRequest)
    this.updateContext(resp.txn)
    const parsed = {
      data: JSON.parse(resp.json.toString()),
      context: resp.txn,
    }
    if (this.config.debug) console.log(`Query response: \n${JSON.stringify(parsed, null, 2)}`)
    return parsed
  }

  async mutate (mutation, commit = true, startTs) {
    const mutationRequest = new protos.Mutation()
    if (mutation.set) mutationRequest.set_nquads = Buffer.from(mutation.set, 'utf8')
    if (mutation.del) mutationRequest.del_nquads = Buffer.from(mutation.del, 'utf8')
    if (startTs) mutationRequest.start_ts = startTs
    mutationRequest.commit_now = commit
    if (this.config.debug) console.log(`Mutation request: \n${JSON.stringify(mutation, null, 2)}`)
    const resp = await this._mutate(mutationRequest)
    const parsed = {
      data: {
        uids: resp.uids,
      },
      context: resp.context,
    }
    if (this.config.debug) console.log(`Mutation response: \n${JSON.stringify(parsed, null, 2)}`)
    return parsed
  }

  async alter (schema) {
    const alterSchema = new protos.Operation()
    alterSchema.schema = schema
    return this._alter(alterSchema)
  }

  async dropAll () {
    const dropAllOp = new protos.Operation()
    dropAllOp.drop_all = true
    return this._alter(dropAllOp)
  }

  async dropAttr (attr) {
    const dropAttr = new protos.Operation()
    dropAttr.drop_atrr = attr
    return this._alter(dropAttr)
  }

  txn () {
    return new Transaction(this)
  }

  updateContext (context) {
    if (context.lin_read) {
      this.linRead = mergeMax(this.linRead, context.lin_read.ids)
    }
  }
}
