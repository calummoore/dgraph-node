'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // @noflow


var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const p1 = _grpc2.default.load(_path2.default.join(__dirname, '/../protos/api.proto'));
exports.default = _extends({}, p1.api);