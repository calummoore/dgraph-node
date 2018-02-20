'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dgraphJs = require('dgraph-js');

class DgraphTransaction {
  constructor(txn, debug) {
    this.txn = txn;
    this.debug = debug;
  }

  async mutate(mutation, options) {
    const mut = new _dgraphJs.Mutation();
    const { commitNow, ignoreConflict } = options || {};
    if (mutation.set) mut.setSetNquads(mutation.set);
    if (mutation.del) mut.setDelNquads(mutation.del);
    mut.setCommitNow(commitNow);
    mut.setIgnoreIndexConflict(ignoreConflict);
    this.log('Mutation request:', mutation, options);
    const resp = await this.txn.mutate(mut);
    const respMap = resp.getUidsMap().toObject() || [];
    const uids = {};
    respMap.forEach(([name, uid]) => {
      uids[name] = uid;
    });
    const parsed = {
      data: {
        uids
      }
    };
    this.log('Mutation response:', parsed);
    return parsed;
  }

  async query(query, vars = null) {
    this.log('Query request:', query, vars);
    const res = await this.txn.queryWithVars(query, vars);
    const data = {
      data: res.getJson()
    };
    this.log('Query response:', data, vars);
    return data;
  }

  async commit() {
    return this.txn.commit();
  }

  async discard() {
    return this.txn.discard();
  }

  log(event, ...params) {
    if (this.debug) {
      const stringy = params.map(param => JSON.stringify(param));
      // eslint-disable-next-line no-console
      console.log(event, ...stringy);
    }
  }
}

exports.default = DgraphTransaction;