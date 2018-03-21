'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dgraphJs = require('dgraph-js');

var _transaction = require('./transaction');

var _transaction2 = _interopRequireDefault(_transaction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DgraphNodeClient {
  constructor(config = {}) {
    let urls = config.url;

    // Make sure we have an array of urls
    if (!Array.isArray(urls)) urls = [urls];

    // Create a list of stubs to pass to client
    this.stubs = urls.map(url => {
      return new _dgraphJs.DgraphClientStub(url, config.credentials);
    });

    // Create the client
    this.client = new _dgraphJs.DgraphClient(...this.stubs);

    // Set initial value for debug
    this.debug = config.debug;
  }

  async mutate(mutation, options) {
    return this.txn().mutate(mutation, _extends({
      commitNow: true,
      ignoreConflict: true
    }, options));
  }

  async set(set, options) {
    return this.mutate({ set }, options);
  }

  async del(del, options) {
    return this.mutate({ del }, options);
  }

  async query(query, vars = null) {
    return this.txn().query(query, vars);
  }

  async alter(schema) {
    const op = new _dgraphJs.Operation();
    op.setSchema(schema);
    this.log('Alter request:', schema);
    const resp = await this.client.alter(op);
    this.log('Alter response:', resp.toObject());
    return resp;
  }

  async dropAll() {
    const op = new _dgraphJs.Operation();
    op.setDropAll(true);
    this.log('Drop All request:');
    const resp = await this.client.alter(op);
    this.log('Drop All response:', resp.toObject());
    return resp;
  }

  txn() {
    return new _transaction2.default(this.client.newTxn(), this.debug);
  }

  close() {
    this.stubs.forEach(stub => {
      stub.close();
    });
  }

  log(event, ...params) {
    if (this.debug) {
      const stringy = params.map(param => JSON.stringify(param));
      // eslint-disable-next-line no-console
      console.log(event, ...stringy);
    }
  }
}

exports.default = DgraphNodeClient;