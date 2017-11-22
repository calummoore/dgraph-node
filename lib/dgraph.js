'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

var _protos = require('./protos');

var _protos2 = _interopRequireDefault(_protos);

var _transaction = require('./transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _util = require('./util');

var _convert = require('./convert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DgraphClient {
  constructor(userConfig) {
    const config = _extends({
      url: 'localhost:9080',
      debug: false
    }, userConfig);

    // Create gprc client into Dgraph
    const d = new _protos2.default.Dgraph(config.url, config.credentials || _grpc2.default.credentials.createInsecure());

    // Promisfy the proto fns
    this._mutate = (0, _es6Promisify2.default)(d.mutate, d);
    this._query = (0, _es6Promisify2.default)(d.query, d);
    this._alter = (0, _es6Promisify2.default)(d.alter, d);
    this._commitOrAbort = (0, _es6Promisify2.default)(d.commitOrAbort, d);

    this.linRead = null;
    this.config = config;
  }

  async query(query, linRead) {
    const queryRequest = new _protos2.default.Request();
    queryRequest.query = query;
    if (linRead || this.linRead) queryRequest.lin_read = (0, _convert.createLinRead)(linRead || this.linRead);
    if (this.config.debug) console.log(`Query request: \n${query}\nLin Read: ${queryRequest.lin_read}`);
    const resp = await this._query(queryRequest);
    this.updateContext(resp.txn);
    const parsed = {
      data: JSON.parse(resp.json.toString()),
      context: resp.txn
    };
    if (this.config.debug) console.log(`Query response: \n${JSON.stringify(parsed, null, 2)}`);
    return parsed;
  }

  async mutate(mutation, commit = true, startTs) {
    const mutationRequest = new _protos2.default.Mutation();
    if (mutation.set) mutationRequest.set_nquads = Buffer.from(mutation.set, 'utf8');
    if (mutation.del) mutationRequest.del_nquads = Buffer.from(mutation.del, 'utf8');
    if (startTs) mutationRequest.start_ts = startTs;
    mutationRequest.commit_now = commit;
    if (this.config.debug) console.log(`Mutation request: \n${JSON.stringify(mutation, null, 2)}`);
    const resp = await this._mutate(mutationRequest);
    const parsed = {
      data: {
        uids: resp.uids
      },
      context: resp.context
    };
    if (this.config.debug) console.log(`Mutation response: \n${JSON.stringify(parsed, null, 2)}`);
    return parsed;
  }

  async alter(schema) {
    const alterSchema = new _protos2.default.Operation();
    alterSchema.schema = schema;
    return this._alter(alterSchema);
  }

  async dropAll() {
    const dropAllOp = new _protos2.default.Operation();
    dropAllOp.drop_all = true;
    return this._alter(dropAllOp);
  }

  async dropAttr(attr) {
    const dropAttr = new _protos2.default.Operation();
    dropAttr.drop_atrr = attr;
    return this._alter(dropAttr);
  }

  txn() {
    return new _transaction2.default(this);
  }

  updateContext(context) {
    if (context.lin_read) {
      this.linRead = (0, _util.mergeMax)(this.linRead, context.lin_read.ids);
    }
  }
}
exports.default = DgraphClient;