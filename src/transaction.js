import union from 'lodash/union'
// import protos from './protos'
import { mergeMax } from './util'
import { createTxnContext } from './convert'

export default class Transaction {
  constructor (client) {
    this.client = client
    this.startTs = null
    this.linRead = client.linRead
    this.keys = []
  }

  async query (query) {
    const resp = await this.client.query(query, this.linRead)
    this.updateContext(resp.context, this.linRead)
    return resp
  }

  async mutate (mutation) {
    const resp = await this.client.mutate(mutation, false, this.startTs)
    this.updateContext(resp.context)
    return resp
  }

  async commit () {
    const { startTs, linRead, keys } = this
    const txnContext = createTxnContext({
      startTs,
      linRead,
      keys,
    })
    return this.client._commitOrAbort(txnContext)
  }

  updateContext (context) {
    if (this.startTs === null) {
      this.startTs = context.start_ts
    }
    if (context.keys) {
      this.keys = union(context.keys.map(s => s.toString()), this.keys || [])
    }
    if (context.lin_read) {
      this.linRead = mergeMax(this.linRead, context.lin_read.ids)
    }
  }
}
