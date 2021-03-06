import * as subject from './sync.js'
import {tuple} from './utils.js'

describe('sync', () => {
  describe('asArray', () => {
    it('should collect all values of an iterable in an array', () => {
      const array = subject.asArray(subject.range({start: 1, end: 4}))

      expect(array).toEqual([1, 2, 3])
    })

    it('should collect all values of an iterator in an array', () => {
      const array = subject.asArray([1, 2, 3][Symbol.iterator]())

      expect(array).toEqual([1, 2, 3])
    })
  })

  describe('range', () => {
    it('should count from start to end', () => {
      const iterator = subject.range({start: 0, end: 3})[Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 0,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(iterator.next()).toEqual({done: true, value: 3})
    })

    it('should count from start to end with negative step value', () => {
      const iterator = subject
        .range({start: 3, end: 0, step: -1})
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(iterator.next()).toEqual({done: true, value: 0})
    })

    it('should stop on overshooting step values', () => {
      const positiveIterator = subject
        .range({start: 0, end: 3, step: 2})
        [Symbol.iterator]()
      const negativeIterator = subject
        .range({start: 3, end: 0, step: -2})
        [Symbol.iterator]()

      expect(positiveIterator.next()).toEqual({
        done: false,
        value: 0,
      })
      expect(positiveIterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(positiveIterator.next()).toEqual({done: true, value: 4})
      expect(negativeIterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(negativeIterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(negativeIterator.next()).toEqual({done: true, value: -1})
    })

    it('should support infinite ranges', () => {
      const iterator = subject.range({start: 3})[Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 4,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 5,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 6,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 7,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 8,
      })
    })

    it('should emit no values if start === end', () => {
      const iterator = subject.range({start: 0, end: 0})[Symbol.iterator]()

      expect(iterator.next()).toEqual({done: true, value: 0})
    })
  })

  describe('enumerate', () => {
    it('should add the index to each element', () => {
      const iterator = subject
        .enumerate(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: {index: 0, item: 'one'},
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: {index: 1, item: 'two'},
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: {index: 2, item: 'three'},
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })
  })

  describe('map', () => {
    it('should apply the provided function over each item', () => {
      const iterator = subject
        .map(item => item.toUpperCase(), ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'THREE',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .map((item: string) => item.toUpperCase())(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
    })
  })

  describe('filterMap', () => {
    it('should apply the provided function over each item and flatten it', () => {
      const iterator = subject
        .filterMap(
          item => (item.length === 3 ? item.toUpperCase() : undefined),
          ['one', 'two', 'three'],
        )
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .filterMap((item: string) =>
          item.length === 3 ? item.toUpperCase() : undefined,
        )(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
    })
  })

  describe('flatMap', () => {
    it('should apply the provided function over each item and flatten it', () => {
      const iterator = subject
        .flatMap(item => [item, item.toUpperCase()], ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'THREE',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .flatMap((item: string) => [item, item.toUpperCase()])([
          'one',
          'two',
          'three',
        ])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('flatten', () => {
    it('should apply flatten the items', () => {
      const iterator = subject
        .flatten([
          [1, 'one'],
          [2, 'two'],
          [3, 'three'],
        ])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })
  })

  describe('filter', () => {
    it('should only pass through items that pass the test', () => {
      const iterator = subject
        .filter(item => item !== 'two', ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .filter(item => item !== 'two')(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('fold', () => {
    it('should return the accumulated value', () => {
      const item = subject.fold(0, (sum, item) => sum + item, [1, 2, 3])

      expect(item).toEqual(6)
    })

    it('should return the initial value if there are no items', () => {
      const item = subject.fold(0, (sum, item) => sum + item, [])

      expect(item).toEqual(0)
    })

    it('should be auto curried', () => {
      const item = subject.fold(0, (sum, item: number) => sum + item)([1, 2, 3])

      expect(item).toEqual(6)
    })
  })

  describe('scan', () => {
    it('should return the accumulated value', () => {
      const iterator = subject
        .scan(0, (sum, item) => sum + item, [1, 2, 3])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 6,
      })
      expect(iterator.next()).toEqual({done: true, value: 6})
    })

    it('should return the initial value if there are no items', () => {
      const iterator = subject
        .scan(0, (sum, item) => sum + item, [])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({done: true, value: 0})
    })

    it('should be auto curried', () => {
      const iterator = subject.scan(
        0,
        (sum, item: number) => sum + item,
      )([1, 2, 3])

      expect(iterator.next()).toEqual({
        done: false,
        value: 1,
      })
    })
  })

  describe('collect', () => {
    it('should collect the values of the iterator in a map', () => {
      const map = subject.collect(item => [item, item ** 2], [1, 2, 3])
      expect(map).toEqual(
        new Map([
          [1, 1],
          [2, 4],
          [3, 9],
        ]),
      )
    })

    it('should overwrite duplicate keys', () => {
      const map = subject.collect(item => [item ** 2, item], [1, 2, 3, -2])
      expect(map).toEqual(
        new Map([
          [1, 1],
          [4, -2],
          [9, 3],
        ]),
      )
    })

    it('should support a custom merge function', () => {
      const map = subject.collect(item => [item ** 2, item], [1, 2, 3, -2], {
        merge: (a, b) => a + b,
      })
      expect(map).toEqual(
        new Map([
          [1, 1],
          [4, 0],
          [9, 3],
        ]),
      )
    })

    it('should be auto curried', () => {
      const collectFn = (item: number) => tuple([item ** 2, item])
      const values = [1, 2, 3, -2]
      const options = {merge: (a: number, b: number) => a + b}
      const result = new Map([
        [1, 1],
        [4, 0],
        [9, 3],
      ])

      const map1 = subject.collect(collectFn, values, options)
      expect(map1).toEqual(result)

      const map2 = subject.collect(collectFn)(values, options)
      expect(map2).toEqual(result)

      const map3 = subject.collect(collectFn, options)(values)
      expect(map3).toEqual(result)
    })
  })

  describe('collectRecord', () => {
    it('should collect the values of the iterator in a map', () => {
      const map = subject.collectRecord(item => [`${item}`, item ** 2], [
        1,
        2,
        3,
      ])
      expect(map).toEqual({1: 1, 2: 4, 3: 9})
    })

    it('should overwrite duplicate keys', () => {
      const map = subject.collectRecord(item => [`${item ** 2}`, item], [
        1,
        2,
        3,
        -2,
      ])
      expect(map).toEqual({1: 1, 4: -2, 9: 3})
    })

    it('should support a custom merge function', () => {
      const map = subject.collectRecord(
        item => [`${item ** 2}`, item],
        [1, 2, 3, -2],
        {
          merge: (a, b) => a + b,
        },
      )
      expect(map).toEqual({1: 1, 4: 0, 9: 3})
    })

    it('should be auto curried', () => {
      const collectFn = (item: number) => tuple([`${item ** 2}`, item])
      const values = [1, 2, 3, -2]
      const options = {merge: (a: number, b: number) => a + b}
      const result = {1: 1, 4: 0, 9: 3}

      const map1 = subject.collectRecord(collectFn, values, options)
      expect(map1).toEqual(result)

      const map2 = subject.collectRecord(collectFn)(values, options)
      expect(map2).toEqual(result)

      const map3 = subject.collectRecord(collectFn, options)(values)
      expect(map3).toEqual(result)
    })
  })

  describe('zip', () => {
    it('should zip two iterators', () => {
      const iterator = subject
        .zip([1, 2, 3], ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return the continuing iterator', () => {
      const longA = [1, 2, 3, 4]
      const longB = ['one', 'two', 'three', 'four']
      const iteratorA = subject
        .zip(longA, ['one', 'two', 'three'])
        [Symbol.iterator]()
      const iteratorB = subject.zip([1, 2, 3], longB)[Symbol.iterator]()

      expect(iteratorA.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(iteratorA.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(iteratorA.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      const doneA = iteratorA.next()
      expect(doneA).toEqual({done: true, value: longA})

      expect(iteratorB.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(iteratorB.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(iteratorB.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      const doneB = iteratorB.next()
      expect(doneB).toEqual({done: true, value: longB})
    })
  })

  describe('all', () => {
    it('should return false if any item fails the test', () => {
      const test1 = subject.all(item => item.length === 3, [
        'one',
        'two',
        'three',
      ])
      const test2 = subject.all(item => item.length === 5, [
        'one',
        'two',
        'three',
      ])

      expect(test1).toBe(false)
      expect(test2).toBe(false)
    })

    it('should return true if all items pass the test', () => {
      const test = subject.all(item => item.length !== 4, [
        'one',
        'two',
        'three',
      ])

      expect(test).toBe(true)
    })

    it('should return true if the iterator is empty', () => {
      const test = subject.all(item => item === 4, [])

      expect(test).toBe(true)
    })

    it('should be auto curried', () => {
      const test = subject.all((item: string) => item.length === 3)([
        'one',
        'two',
        'three',
      ])

      expect(test).toBe(false)
    })
  })

  describe('any', () => {
    it('should return true if any item pass the test', () => {
      const test1 = subject.any(item => item.length === 3, [
        'one',
        'two',
        'three',
      ])
      const test2 = subject.any(item => item.length === 5, [
        'one',
        'two',
        'three',
      ])

      expect(test1).toBe(true)
      expect(test2).toBe(true)
    })

    it('should return true if all items fails the test', () => {
      const test = subject.any(item => item.length === 4, [
        'one',
        'two',
        'three',
      ])

      expect(test).toBe(false)
    })

    it('should return false if the iterator is empty', () => {
      const test = subject.any(item => item === 4, [])

      expect(test).toBe(false)
    })

    it('should be auto curried', () => {
      const test = subject.any((item: string) => item.length === 3)([
        'one',
        'two',
        'three',
      ])

      expect(test).toBe(true)
    })
  })

  describe('find', () => {
    it('should return the first item that pass the test', () => {
      const item = subject.find(item => item.length === 3, [
        'one',
        'two',
        'three',
      ])
      const item2 = subject.find(item => item.length === 5, [
        'one',
        'two',
        'three',
      ])

      expect(item).toEqual('one')
      expect(item2).toEqual('three')
    })

    it('should return undefined if no item pass the test', () => {
      const item = subject.find(item => item.length === 4, [
        'one',
        'two',
        'three',
      ])

      expect(item).toEqual(undefined)
    })

    it('should be auto curried', () => {
      const item = subject.find((item: string) => item.length === 3)([
        'one',
        'two',
        'three',
      ])

      expect(item).toEqual('one')
    })
  })

  describe('partition', () => {
    it('should return a tuple of passing and failing elements', () => {
      const [even, odd] = subject.partition(item => item % 2 === 0, [
        1,
        2,
        3,
        4,
        5,
      ])

      expect(even).toEqual([2, 4])
      expect(odd).toEqual([1, 3, 5])
    })

    it('should be auto curried', () => {
      const [even, odd] = subject.partition((item: number) => item % 2 === 0)([
        1,
        2,
        3,
      ])

      expect(even).toEqual([2])
      expect(odd).toEqual([1, 3])
    })
  })

  describe('first', () => {
    it('should return the first item', () => {
      const item = subject.first(['one', 'two', 'three'])

      expect(item).toEqual('one')
    })

    it('should return undefined if there are no items', () => {
      const item = subject.first([])

      expect(item).toEqual(undefined)
    })
  })

  describe('skip', () => {
    it('should skip the first n items', () => {
      const iterator = subject
        .skip(2, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return all items if skip is zero', () => {
      const iterator = subject
        .skip(0, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should no items if n is greater than the size of the iterable', () => {
      const iterator = subject
        .skip(4, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .skip(1)(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
    })
  })

  describe('skipWhile', () => {
    it('should skip the first items test returns true for', () => {
      const iterator = subject
        .skipWhile(item => item.length === 3, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return all items if test directly returns false', () => {
      const iterator = subject
        .skipWhile(() => false, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should no items if test always return true', () => {
      const iterator = subject
        .skipWhile(() => true, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .skipWhile(item => item === 'one')(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
    })
  })

  describe('take', () => {
    it('should return the first n items', () => {
      const iterator = subject
        .take(2, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return avalible items if n is greater than the size of the iterable', () => {
      const iterator = subject
        .take(4, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .take(2)(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('takeWhile', () => {
    it('should return the first items test returns true for', () => {
      const iterator = subject
        .takeWhile(item => item.length === 3, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return all items if test always return true', () => {
      const iterator = subject
        .takeWhile(() => true, ['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', () => {
      const iterator = subject
        .takeWhile(item => item === 'one')(['one', 'two', 'three'])
        [Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('last', () => {
    it('should return the last item', () => {
      const item = subject.last(['one', 'two', 'three'])

      expect(item).toEqual('three')
    })

    it('should return undefined if there are no items', () => {
      const item = subject.last([])

      expect(item).toEqual(undefined)
    })
  })

  describe('sort', () => {
    it('should return a sorted array', () => {
      const items = subject.sort((a, b) => a - b, [2, 1, 3])

      expect(items).toEqual([1, 2, 3])
    })
  })
})
