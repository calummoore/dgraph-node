'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTxnContext = createTxnContext;
exports.createLinRead = createLinRead;

var _protos = require('./protos');

var _protos2 = _interopRequireDefault(_protos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTxnContext({ startTs, keys, linRead }) {
  const txnContext = new _protos2.default.TxnContext();
  txnContext.keys = keys;
  txnContext.start_ts = startTs;
  txnContext.lin_read = createLinRead(linRead);
  return txnContext;
}

function createLinRead(linRead) {
  const lr = new _protos2.default.LinRead();
  lr.ids = linRead;
  return lr;
}