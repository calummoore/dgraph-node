'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeMax = mergeMax;

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mergeMax(map, altMap) {
  return (0, _reduce2.default)(altMap, (mergedMap, value, key) => {
    // eslint-disable-next-line no-param-reassign
    mergedMap[key] = mergedMap[key] ? Math.max(mergedMap[key], parseFloat(value)) : parseFloat(value);
    return mergedMap;
  }, map || {});
}