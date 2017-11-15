'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var grpc = _interopDefault(require('grpc'));
var promisify = _interopDefault(require('es6-promisify'));
var path = _interopDefault(require('path'));
var union = _interopDefault(require('lodash/union'));
var reduce = _interopDefault(require('lodash/reduce'));

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// @noflow
var p1 = grpc.load(path.join(__dirname, '/../protos/task.proto'));
var protos = _extends$1({}, p1.protos);

function mergeMax(map, altMap) {
  return reduce(altMap, function (mergedMap, value, key) {
    // eslint-disable-next-line no-param-reassign
    mergedMap[key] = mergedMap[key] ? Math.max(mergedMap[key], parseFloat(value)) : parseFloat(value);
    return mergedMap;
  }, map || {});
}

function createTxnContext(_ref) {
  var startTs = _ref.startTs,
      keys = _ref.keys,
      linRead = _ref.linRead;

  var txnContext = new protos.TxnContext();
  txnContext.keys = keys;
  txnContext.start_ts = startTs;
  txnContext.lin_read = createLinRead(linRead);
  return txnContext;
}

function createLinRead(linRead) {
  var lr = new protos.LinRead();
  lr.ids = linRead;
  return lr;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator$1(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import protos from './protos'
var Transaction = function () {
  function Transaction(client) {
    _classCallCheck$1(this, Transaction);

    this.client = client;
    this.startTs = null;
    this.linRead = client.linRead;
    this.keys = [];
  }

  _createClass$1(Transaction, [{
    key: 'query',
    value: function () {
      var _ref = _asyncToGenerator$1(regeneratorRuntime.mark(function _callee(_query) {
        var resp;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.client.query(_query, this.linRead);

              case 2:
                resp = _context.sent;

                this.updateContext(resp.context, this.linRead);
                return _context.abrupt('return', resp);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function query(_x) {
        return _ref.apply(this, arguments);
      }

      return query;
    }()
  }, {
    key: 'mutate',
    value: function () {
      var _ref2 = _asyncToGenerator$1(regeneratorRuntime.mark(function _callee2(mutation) {
        var resp;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.client.mutate(mutation, false, this.startTs);

              case 2:
                resp = _context2.sent;

                this.updateContext(resp.context);
                return _context2.abrupt('return', resp);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function mutate(_x2) {
        return _ref2.apply(this, arguments);
      }

      return mutate;
    }()
  }, {
    key: 'commit',
    value: function () {
      var _ref3 = _asyncToGenerator$1(regeneratorRuntime.mark(function _callee3() {
        var startTs, linRead, keys, txnContext;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                startTs = this.startTs, linRead = this.linRead, keys = this.keys;
                txnContext = createTxnContext({
                  startTs: startTs,
                  linRead: linRead,
                  keys: keys
                });
                return _context3.abrupt('return', this.client._commitOrAbort(txnContext));

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function commit() {
        return _ref3.apply(this, arguments);
      }

      return commit;
    }()
  }, {
    key: 'updateContext',
    value: function updateContext(context) {
      if (this.startTs === null) {
        this.startTs = context.start_ts;
      }
      if (context.keys) {
        this.keys = union(context.keys.map(function (s) {
          return s.toString();
        }), this.keys || []);
      }
      if (context.lin_read) {
        this.linRead = mergeMax(this.linRead, context.lin_read.ids);
      }
    }
  }]);

  return Transaction;
}();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DgraphClient$1 = function () {
  function DgraphClient(userConfig) {
    _classCallCheck(this, DgraphClient);

    var config = _extends({
      url: 'localhost:9080',
      debug: false
    }, userConfig);

    // Create gprc client into Dgraph
    var d = new protos.Dgraph(config.url, config.credentials || grpc.credentials.createInsecure());

    // Promisfy the proto fns
    this._mutate = promisify(d.mutate, d);
    this._query = promisify(d.query, d);
    this._alter = promisify(d.alter, d);
    this._commitOrAbort = promisify(d.commitOrAbort, d);

    this.linRead = null;
    this.config = config;
  }

  _createClass(DgraphClient, [{
    key: 'query',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_query, linRead) {
        var queryRequest, resp;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                queryRequest = new protos.Request();

                queryRequest.query = _query;
                if (linRead || this.linRead) queryRequest.lin_read = createLinRead(linRead || this.linRead);
                _context.next = 5;
                return this._query(queryRequest);

              case 5:
                resp = _context.sent;

                this.updateContext(resp.txn);
                return _context.abrupt('return', {
                  data: JSON.parse(resp.json.toString()),
                  context: resp.txn
                });

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function query(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return query;
    }()
  }, {
    key: 'mutate',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(mutation) {
        var commit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var startTs = arguments[2];
        var mutationRequest, resp;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                mutationRequest = new protos.Mutation();

                if (mutation.set) mutationRequest.set_nquads = Buffer.from(mutation.set, 'utf8');
                if (mutation.del) mutationRequest.del_nquads = Buffer.from(mutation.del, 'utf8');
                if (startTs) mutationRequest.start_ts = startTs;
                mutationRequest.commit_now = commit;
                _context2.next = 7;
                return this._mutate(mutationRequest);

              case 7:
                resp = _context2.sent;
                return _context2.abrupt('return', {
                  data: {
                    uids: resp.uids
                  },
                  context: resp.context
                });

              case 9:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function mutate(_x3) {
        return _ref2.apply(this, arguments);
      }

      return mutate;
    }()
  }, {
    key: 'alter',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(schema) {
        var alterSchema;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                alterSchema = new protos.Operation();

                alterSchema.schema = schema;
                return _context3.abrupt('return', this._alter(alterSchema));

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function alter(_x5) {
        return _ref3.apply(this, arguments);
      }

      return alter;
    }()
  }, {
    key: 'dropAll',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var dropAllOp;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                dropAllOp = new protos.Operation();

                dropAllOp.drop_all = true;
                return _context4.abrupt('return', this._alter(dropAllOp));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dropAll() {
        return _ref4.apply(this, arguments);
      }

      return dropAll;
    }()
  }, {
    key: 'dropAttr',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(attr) {
        var dropAttr;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                dropAttr = new protos.Operation();

                dropAttr.drop_atrr = attr;
                return _context5.abrupt('return', this._alter(dropAttr));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function dropAttr(_x6) {
        return _ref5.apply(this, arguments);
      }

      return dropAttr;
    }()
  }, {
    key: 'txn',
    value: function txn() {
      return new Transaction(this);
    }
  }, {
    key: 'updateContext',
    value: function updateContext(context) {
      if (context.lin_read) {
        this.linRead = mergeMax(this.linRead, context.lin_read.ids);
      }
    }
  }]);

  return DgraphClient;
}();

exports.protos = protos;
exports['default'] = DgraphClient$1;
