import * as subject from './sync'

describe('async', () => {
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
      const iterator = subject.map((item: string) => item.toUpperCase())([
        'one',
        'two',
        'three',
      ])[Symbol.iterator]()

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
      const iterator = subject.flatMap((item: string) => [
        item,
        item.toUpperCase(),
      ])(['one', 'two', 'three'])[Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
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
      const iterator = subject.filter(item => item !== 'two')([
        'one',
        'two',
        'three',
      ])[Symbol.iterator]()

      expect(iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
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

    it('should be auto curried', () => {
      const iterator = subject.take(2)(['one', 'two', 'three'])[
        Symbol.iterator
      ]()

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
})
