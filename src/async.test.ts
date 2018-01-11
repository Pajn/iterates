import * as subject from './async'
import {Awaitable} from './async'

if (typeof Symbol.asyncIterator === 'undefined') {
  ;(Symbol as any).asyncIterator = Symbol()
}

async function* asAsync<T>(...items: Array<T>): AsyncIterable<T> {
  for (const item of items) {
    yield Promise.resolve(item)
  }
}

describe('async', () => {
  describe('enumerate', () => {
    it('should add the index to each element', async () => {
      const iterator = subject
        .enumerate(asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: {index: 0, item: 'one'},
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: {index: 1, item: 'two'},
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: {index: 2, item: 'three'},
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })
  })

  describe('map', () => {
    it('should apply the provided function over each item', async () => {
      const iterator = subject
        .map(item => item.toUpperCase(), asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'THREE',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject.map((item: string) => item.toUpperCase())(
        asAsync('one', 'two', 'three'),
      )[Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
    })
  })

  describe('filterMap', () => {
    it('should apply the provided function over each item and flatten it', async () => {
      const iterator = subject
        .filterMap(
          item => (item.length === 3 ? item.toUpperCase() : undefined),
          asAsync('one', 'two', 'three'),
        )
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject.filterMap(
        (item: string) => (item.length === 3 ? item.toUpperCase() : undefined),
      )(asAsync('one', 'two', 'three'))[Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
    })
  })

  describe('flatMap', () => {
    it('should apply the provided function over each item and flatten it', async () => {
      const iterator = subject
        .flatMap(
          item =>
            asAsync<Awaitable<string>>(
              item,
              Promise.resolve(item.toUpperCase()),
            ),
          asAsync<Awaitable<string>>('one', Promise.resolve('two'), 'three'),
        )
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'ONE',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'TWO',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'THREE',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject.flatMap((item: string) =>
        asAsync(item, item.toUpperCase()),
      )(asAsync('one', 'two', 'three'))[Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('flatten', () => {
    it('should flatten the items', async () => {
      const iterator = subject
        .flatten(
          asAsync(
            asAsync<number | string>(1, 'one'),
            asAsync<number | string>(2, 'two'),
            asAsync<number | string>(3, 'three'),
          ),
        )
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    // it('should suport sync iterables', async () => {
    //   const iterator = subject
    //     .flatten(asAsync([1, 'one'], [2, 'two'], [3, 'three']))
    //     [Symbol.asyncIterator]()

    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 1,
    //   })
    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 'one',
    //   })
    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 2,
    //   })
    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 'two',
    //   })
    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 3,
    //   })
    //   expect(await iterator.next()).toEqual({
    //     done: false,
    //     value: 'three',
    //   })
    //   expect(await iterator.next()).toEqual({done: true, value: undefined})
    // })
  })

  describe('filter', () => {
    it('should only pass through items that pass the test', async () => {
      const iterator = subject
        .filter(item => item !== 'two', asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject.filter(item => item !== 'two')(
        asAsync('one', 'two', 'three'),
      )[Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('zip', () => {
    it('should zip two iterators', async () => {
      const iterator = subject
        .zip(asAsync(1, 2, 3), asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should return the continuing iterator', async () => {
      const longA = asAsync(1, 2, 3, 4)
      const longB = asAsync('one', 'two', 'three', 'four')
      const iteratorA = subject
        .zip(longA, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()
      const iteratorB = subject
        .zip(asAsync(1, 2, 3), longB)
        [Symbol.asyncIterator]()

      expect(await iteratorA.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(await iteratorA.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(await iteratorA.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      const doneA = await iteratorA.next()
      expect(doneA).toEqual({done: true, value: longA})

      expect(await iteratorB.next()).toEqual({
        done: false,
        value: [1, 'one'],
      })
      expect(await iteratorB.next()).toEqual({
        done: false,
        value: [2, 'two'],
      })
      expect(await iteratorB.next()).toEqual({
        done: false,
        value: [3, 'three'],
      })
      const doneB = await iteratorB.next()
      expect(doneB).toEqual({done: true, value: longB})
    })
  })

  describe('find', () => {
    it('should return the first item that pass the test', async () => {
      const item = await subject.find(
        item => item.length === 3,
        asAsync('one', 'two', 'three'),
      )
      const item2 = await subject.find(
        item => item.length === 5,
        asAsync('one', 'two', 'three'),
      )

      expect(item).toEqual('one')
      expect(item2).toEqual('three')
    })

    it('should return undefined if no item pass the test', async () => {
      const item = await subject.find(
        item => item.length === 4,
        asAsync('one', 'two', 'three'),
      )

      expect(item).toEqual(undefined)
    })

    it('should be auto curried', async () => {
      const item = await subject.find((item: string) => item.length === 3)(
        asAsync('one', 'two', 'three'),
      )

      expect(item).toEqual('one')
    })
  })

  describe('first', () => {
    it('should return the first item', async () => {
      const item = await subject.first(asAsync('one', 'two', 'three'))

      expect(item).toEqual('one')
    })

    it('should return undefined if there are no items', async () => {
      const item = await subject.first(asAsync())

      expect(item).toEqual(undefined)
    })
  })

  describe('take', () => {
    it('should return the first n items', async () => {
      const iterator = subject
        .take(2, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject.take(2)(asAsync('one', 'two', 'three'))[
        Symbol.asyncIterator
      ]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('last', () => {
    it('should return the last item', async () => {
      const item = await subject.last(asAsync('one', 'two', 'three'))

      expect(item).toEqual('three')
    })

    it('should return undefined if there are no items', async () => {
      const item = await subject.last(asAsync())

      expect(item).toEqual(undefined)
    })
  })
})
