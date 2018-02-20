import { DgraphClientStub, DgraphClient, Operation } from 'dgraph-js'

import DgraphTransaction from './transaction'

class DgraphNodeClient {
  constructor (config = {}) {
    let urls = config.url

    // Make sure we have an array of urls
    if (!Array.isArray(urls)) urls = [urls]

    // Create a list of stubs to pass to client
    this.stubs = urls.map((url) => {
      return (new DgraphClientStub(
        url,
        config.credentials,
      ))
    })

    // Create the client
    this.client = new DgraphClient(...this.stubs)

    // Set initial value for debug
    this.debug = config.debug
  }

  async mutate (mutation, options) {
    return this.txn().mutate(mutation, {
      commitNow: true,
      ignoreConflict: true,
      ...options,
    })
  }

  async query (query, vars = null) {
    return this.txn().query(query, vars)
  }

  async alter (schema) {
    const op = new Operation()
    op.setSchema(schema)
    this.log('Alter request:', schema)
    const resp = await this.client.alter(op)
    this.log('Alter response:', resp.toObject())
    return resp
  }

  async dropAll () {
    const op = new Operation()
    op.setDropAll(true)
    this.log('Drop All request:')
    const resp = await this.client.alter(op)
    this.log('Drop All response:', resp.toObject())
    return resp
  }

  txn () {
    return new DgraphTransaction(this.client.newTxn(), this.debug)
  }

  close () {
    this.stubs.forEach((stub) => {
      stub.close()
    })
  }

  log (event, ...params) {
    if (this.debug) {
      const stringy = params.map(param => JSON.stringify(param))
      // eslint-disable-next-line no-console
      console.log(event, ...stringy)
    }
  }
}

export default DgraphNodeClient
