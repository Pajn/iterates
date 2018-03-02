import {pipeValue, sync} from '.'

describe('utils', () => {
  describe('pipeValue', () => {
    it('should call all the functions in order', () => {
      const result = pipeValue(
        [1, 2, 3],
        sync.map(item => sync.range({start: 0, end: item})),
        sync.map(sync.asArray),
        sync.enumerate,
        sync.collect(({index, item}) => [index, item]),
      )

      expect(result).toEqual(new Map([[0, [0]], [1, [0, 1]], [2, [0, 1, 2]]]))
    })
  })
})
