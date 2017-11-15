import reduce from 'lodash/reduce'

export function mergeMax (map, altMap) {
  return reduce(altMap, (mergedMap, value, key) => {
    // eslint-disable-next-line no-param-reassign
    mergedMap[key] = mergedMap[key]
      ? Math.max(mergedMap[key], parseFloat(value)) : parseFloat(value)
    return mergedMap
  }, map || {})
}
