'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _util = require('./util');

var _convert = require('./convert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import protos from './protos'
class Transaction {
  constructor(client) {
    this.client = client;
    this.startTs = null;
    this.linRead = client.linRead;
    this.keys = [];
  }

  async query(query) {
    const resp = await this.client.query(query, this.linRead);
    this.updateContext(resp.context, this.linRead);
    return resp;
  }

  async mutate(mutation) {
    const resp = await this.client.mutate(mutation, false, this.startTs);
    this.updateContext(resp.context);
    return resp;
  }

  async commit() {
    const { startTs, linRead, keys } = this;
    const txnContext = (0, _convert.createTxnContext)({
      startTs,
      linRead,
      keys
    });
    return this.client._commitOrAbort(txnContext);
  }

  updateContext(context) {
    if (this.startTs === null) {
      this.startTs = context.start_ts;
    }
    if (context.keys) {
      this.keys = (0, _union2.default)(context.keys.map(s => s.toString()), this.keys || []);
    }
    if (context.lin_read) {
      this.linRead = (0, _util.mergeMax)(this.linRead, context.lin_read.ids);
    }
  }
}
exports.default = Transaction;