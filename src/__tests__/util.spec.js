/* eslint-disable quote-props */
/* eslint-disable quotes */
import { mergeMax } from '../util'

describe('util', () => {
  describe('mergeMax', () => {
    it('should merge two differnt maps', () => {
      const map1 = { "1": 10 }
      const map2 = { "2": 12, "3": 14 }
      expect(mergeMax(map1, map2)).toEqual({
        "1": 10,
        "2": 12,
        "3": 14,
      })
    })

    it('should use max if lower prop merged', () => {
      const map1 = { "1": 12 }
      const map2 = { "1": 10 }
      expect(mergeMax(map1, map2)).toEqual({
        "1": 12,
      })
    })

    it('should use max if higher prop merged', () => {
      const map1 = { "1": 10 }
      const map2 = { "1": 12 }
      expect(mergeMax(map1, map2)).toEqual({
        "1": 12,
      })
    })

    it('should merge if props are the same', () => {
      const map1 = { "1": 10 }
      const map2 = { "1": 10 }
      expect(mergeMax(map1, map2)).toEqual({
        "1": 10,
      })
    })

    it('should handle null for base map', () => {
      const map1 = null
      const map2 = { "1": 10 }
      expect(mergeMax(map1, map2)).toEqual({
        "1": 10,
      })
    })

    it('should handle null for merged map', () => {
      const map1 = { "1": 10 }
      const map2 = null
      expect(mergeMax(map1, map2)).toEqual({
        "1": 10,
      })
    })
  })
})
