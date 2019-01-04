import {tuple} from '.'
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
  describe('asAsyncIterable', () => {
    it('should turn a syncronous iterable to an asynchronous iterable', async () => {
      const iterator = subject
        .asAsyncIterable([1, 2, 3])
        [Symbol.asyncIterator]()

      const firstValue = iterator.next()
      expect(firstValue).toBeInstanceOf(Promise)
      expect(await firstValue).toEqual({
        done: false,
        value: 1,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should turn a syncronous iterator to an asynchronous iterable', async () => {
      const iterator = subject
        .asAsyncIterable([1, 2, 3][Symbol.iterator]())
        [Symbol.asyncIterator]()

      const firstValue = iterator.next()
      expect(firstValue).toBeInstanceOf(Promise)
      expect(await firstValue).toEqual({
        done: false,
        value: 1,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 2,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })
  })

  describe('asArray', () => {
    it('should collect all values of an iterable in an array', async () => {
      const array = await subject.asArray(asAsync(1, 2, 3))

      expect(array).toEqual([1, 2, 3])
    })

    it('should collect all values of an iterator in an array', async () => {
      const array = await subject.asArray(
        asAsync(1, 2, 3)[Symbol.asyncIterator](),
      )

      expect(array).toEqual([1, 2, 3])
    })
  })

  describe('fromPromise', () => {
    it('should yield the value from the promise', async () => {
      const iterator = subject.fromPromise(Promise.resolve(42))

      expect(await iterator.next()).toEqual({done: false, value: 42})
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })
  })

  describe('Subject', () => {
    it('should buffer items', async () => {
      const controller = new subject.Subject()
      const iterator1 = controller[Symbol.asyncIterator]()
      const iterator2 = controller[Symbol.asyncIterator]()

      controller.next('A')
      controller.next('B')
      controller.next('C')
      controller.done()

      expect(await iterator1.next()).toEqual({
        done: false,
        value: 'A',
      })
      expect(await iterator2.next()).toEqual({
        done: false,
        value: 'A',
      })
      expect(await iterator1.next()).toEqual({
        done: false,
        value: 'B',
      })
      expect(await iterator2.next()).toEqual({
        done: false,
        value: 'B',
      })
      expect(await iterator1.next()).toEqual({
        done: false,
        value: 'C',
      })
      expect(await iterator2.next()).toEqual({
        done: false,
        value: 'C',
      })
      expect(await iterator1.next()).toEqual({
        done: true,
        value: undefined,
      })
      expect(await iterator2.next()).toEqual({
        done: true,
        value: undefined,
      })
    })

    it('should support items pushed after next', async () => {
      const controller = new subject.Subject()
      const iterator = controller[Symbol.asyncIterator]()

      const aValue = iterator.next()
      const bValue = iterator.next()
      const cValue = iterator.next()
      const doneValue = iterator.next()
      controller.next('A')
      controller.next('B')
      controller.next('C')
      controller.done()

      expect(await aValue).toEqual({
        done: false,
        value: 'A',
      })
      expect(await bValue).toEqual({
        done: false,
        value: 'B',
      })
      expect(await cValue).toEqual({
        done: false,
        value: 'C',
      })
      expect(await doneValue).toEqual({
        done: true,
        value: undefined,
      })
    })

    it('should support errors', async () => {
      const controller = new subject.Subject()
      const iterator = controller[Symbol.asyncIterator]()

      controller.throw(new Error('Thrown error'))

      await expect(iterator.next()).rejects.toEqual(Error('Thrown error'))
    })

    it('should throw errors if called after beeing ended', async () => {
      const controller = new subject.Subject()

      controller.done()

      expect(() => controller.next('Value')).toThrow()
      expect(() => controller.throw('Value')).toThrow()
      expect(() => controller.done()).toThrow()
    })
  })

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
      const iterator = subject
        .map((item: string) => item.toUpperCase())(
          asAsync('one', 'two', 'three'),
        )
        [Symbol.asyncIterator]()

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
      const iterator = subject
        .filterMap((item: string) =>
          item.length === 3 ? item.toUpperCase() : undefined,
        )(asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

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
      const iterator = subject
        .flatMap((item: string) => asAsync(item, item.toUpperCase()))(
          asAsync('one', 'two', 'three'),
        )
        [Symbol.asyncIterator]()

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
      const iterator = subject
        .filter(item => item !== 'two')(asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })
  })

  describe('fold', () => {
    it('should return the accumulated value', async () => {
      const item = await subject.fold(
        0,
        (sum, item) => sum + item,
        asAsync(1, 2, 3),
      )

      expect(item).toEqual(6)
    })

    it('should return the initial value if there are no items', async () => {
      const item = await subject.fold(
        0,
        (sum, item) => sum + item,
        asAsync<number>(),
      )

      expect(item).toEqual(0)
    })

    it('should be auto curried', async () => {
      const item = await subject.fold(0, (sum, item: number) => sum + item)(
        asAsync(1, 2, 3),
      )

      expect(item).toEqual(6)
    })
  })

  describe('scan', () => {
    it('should return the accumulated value', async () => {
      const iterator = await subject
        .scan(0, (sum, item) => sum + item, asAsync(1, 2, 3))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 1,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 3,
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 6,
      })
      expect(await iterator.next()).toEqual({done: true, value: 6})
    })

    it('should return the initial value if there are no items', async () => {
      const iterator = await subject
        .scan(0, (sum, item) => sum + item, asAsync<number>())
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({done: true, value: 0})
    })

    it('should be auto curried', async () => {
      const iterator = subject.scan(0, (sum, item: number) => sum + item)(
        asAsync(1, 2, 3),
      )

      expect(await iterator.next()).toEqual({
        done: false,
        value: 1,
      })
    })
  })

  describe('collect', () => {
    it('should collect the values of the iterator in a map', async () => {
      const map = await subject.collect(
        item => [item, item ** 2],
        asAsync(1, 2, 3),
      )
      expect(map).toEqual(new Map([[1, 1], [2, 4], [3, 9]]))
    })

    it('should overwrite duplicate keys', async () => {
      const map = await subject.collect(
        item => [item ** 2, item],
        asAsync(1, 2, 3, -2),
      )
      expect(map).toEqual(new Map([[1, 1], [4, -2], [9, 3]]))
    })

    it('should support a custom merge function', async () => {
      const map = await subject.collect(
        item => [item ** 2, item],
        asAsync(1, 2, 3, -2),
        {
          merge: (a, b) => a + b,
        },
      )
      expect(map).toEqual(new Map([[1, 1], [4, 0], [9, 3]]))
    })

    it('should be auto curried', async () => {
      const collectFn = (item: number) => tuple([item ** 2, item])
      const values = () => asAsync(1, 2, 3, -2)
      const options = {merge: (a, b) => a + b}
      const result = new Map([[1, 1], [4, 0], [9, 3]])

      const map1 = await subject.collect(collectFn, values(), options)
      expect(map1).toEqual(result)

      const map2 = await subject.collect(collectFn)(values(), options)
      expect(map2).toEqual(result)

      const map3 = await subject.collect(collectFn, options)(values())
      expect(map3).toEqual(result)
    })
  })

  describe('collectRecord', () => {
    it('should collect the values of the iterator in a map', async () => {
      const map = await subject.collectRecord(
        item => [`${item}`, item ** 2],
        asAsync(1, 2, 3),
      )
      expect(map).toEqual({1: 1, 2: 4, 3: 9})
    })

    it('should overwrite duplicate keys', async () => {
      const map = await subject.collectRecord(
        item => [`${item ** 2}`, item],
        asAsync(1, 2, 3, -2),
      )
      expect(map).toEqual({1: 1, 4: -2, 9: 3})
    })

    it('should support a custom merge function', async () => {
      const map = await subject.collectRecord(
        item => [`${item ** 2}`, item],
        asAsync(1, 2, 3, -2),
        {
          merge: (a, b) => a + b,
        },
      )
      expect(map).toEqual({1: 1, 4: 0, 9: 3})
    })

    it('should be auto curried', async () => {
      const collectFn = (item: number) => tuple([`${item ** 2}`, item])
      const values = () => asAsync(1, 2, 3, -2)
      const options = {merge: (a, b) => a + b}
      const result = {1: 1, 4: 0, 9: 3}

      const map1 = await subject.collectRecord(collectFn, values(), options)
      expect(map1).toEqual(result)

      const map2 = await subject.collectRecord(collectFn)(values(), options)
      expect(map2).toEqual(result)

      const map3 = await subject.collectRecord(collectFn, options)(values())
      expect(map3).toEqual(result)
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

  describe('throttle', () => {
    let nowMock: jest.Mock<number>
    let realNow = Date.now

    async function setTime(time: number) {
      // First, force a spin of the event loop
      await new Promise(resolve => setTimeout(resolve))
      nowMock.mockReturnValue(time)
    }

    beforeEach(() => {
      Date.now = nowMock = jest.fn()
    })

    afterEach(() => {
      Date.now = realNow
    })

    it('should skip items that arrive quicker than the duration', async () => {
      const controller = new subject.Subject()
      const iterator = subject.throttle(10, controller)[Symbol.asyncIterator]()
      await setTime(10)

      const a = iterator.next()

      controller.next('A')
      controller.next('B')
      await setTime(15)
      controller.next('C')

      const b = iterator.next()

      await setTime(20)

      const c = iterator.next()

      await setTime(35)

      controller.next('D')
      controller.next('E')

      await setTime(40)

      controller.next('F')

      await setTime(45)

      controller.next('G')

      expect(await a).toEqual({
        done: false,
        value: 'A',
      })
      expect(await b).toEqual({
        done: false,
        value: 'D',
      })
      expect(await c).toEqual({
        done: false,
        value: 'G',
      })
    })

    it("should emit the last item even though it's inside the duration", async () => {
      const controller = new subject.Subject()
      const iterator = subject.throttle(10, controller)[Symbol.asyncIterator]()
      await setTime(10)

      const a = iterator.next()
      const b = iterator.next()
      const c = iterator.next()

      controller.next('A')
      controller.next('B')
      controller.done()

      expect(await a).toEqual({
        done: false,
        value: 'A',
      })
      expect(await b).toEqual({
        done: false,
        value: 'B',
      })
      expect(await c).toEqual({
        done: true,
        value: undefined,
      })
    })
  })

  describe('all', () => {
    it('should return false if any item fails the test', async () => {
      const test1 = await subject.all(
        item => item.length === 3,
        asAsync('one', 'two', 'three'),
      )
      const test2 = await subject.all(
        item => item.length === 5,
        asAsync('one', 'two', 'three'),
      )

      expect(test1).toBe(false)
      expect(test2).toBe(false)
    })

    it('should return true if all items pass the test', async () => {
      const test = await subject.all(
        item => item.length !== 4,
        asAsync('one', 'two', 'three'),
      )

      expect(test).toBe(true)
    })

    it('should return true if the iterator is empty', async () => {
      const test = await subject.all(item => item, asAsync())

      expect(test).toBe(true)
    })

    it('should be auto curried', async () => {
      const test = await subject.all((item: string) => item.length === 3)(
        asAsync('one', 'two', 'three'),
      )

      expect(test).toBe(false)
    })
  })

  describe('any', () => {
    it('should return true if any item pass the test', async () => {
      const test1 = await subject.any(
        item => item.length === 3,
        asAsync('one', 'two', 'three'),
      )
      const test2 = await subject.any(
        item => item.length === 5,
        asAsync('one', 'two', 'three'),
      )

      expect(test1).toBe(true)
      expect(test2).toBe(true)
    })

    it('should return true if all items fails the test', async () => {
      const test = await subject.any(
        item => item.length === 4,
        asAsync('one', 'two', 'three'),
      )

      expect(test).toBe(false)
    })

    it('should return false if the iterator is empty', async () => {
      const test = await subject.any(item => item, asAsync())

      expect(test).toBe(false)
    })

    it('should be auto curried', async () => {
      const test = await subject.any((item: string) => item.length === 3)(
        asAsync('one', 'two', 'three'),
      )

      expect(test).toBe(true)
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

  describe('partition', () => {
    it('should return a tuple of passing and failing elements', async () => {
      const [even, odd] = await subject.partition(
        item => item % 2 === 0,
        asAsync(1, 2, 3, 4, 5),
      )

      expect(even).toEqual([2, 4])
      expect(odd).toEqual([1, 3, 5])
    })

    it('should be auto curried', async () => {
      const [even, odd] = await subject.partition(
        (item: number) => item % 2 === 0,
      )(asAsync(1, 2, 3))

      expect(even).toEqual([2])
      expect(odd).toEqual([1, 3])
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

    it('should return avalible items if n is greater than the size of the iterable', async () => {
      const iterator = subject
        .take(4, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(await iterator.next()).toEqual({done: true, value: undefined})
    })

    it('should be auto curried', async () => {
      const iterator = subject
        .take(2)(asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
    })

    it('should end the iterator immediately after taking the requested number of items', async () => {
      const controller = new subject.Subject()
      const iterator = subject.take(2, controller)

      const test1 = iterator.next()
      const test2 = iterator.next()

      controller.next(1)
      controller.next(2)

      await test1
      await test2
      expect(await iterator.next()).toEqual({
        done: true,
      })
    })

    it('should end the iterator immediately when taking zero items', async () => {
      const controller = new subject.Subject()
      const iterator = subject.take(0, controller)

      const test = iterator.next()

      controller.next(1)

      expect(await test).toEqual({
        done: true,
      })
    })
  })

  describe('takeUntil', () => {
    it('should yield items until the notifier resolves', async () => {
      const controller = new subject.Subject()
      const iterator = subject
        .takeUntil(controller, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      controller.done()
      expect(await iterator.next()).toEqual({
        done: true,
        value: {done: true, value: undefined},
      })
    })

    it('should return the notifiers IteratorResult', async () => {
      const controller = new subject.Subject()
      const iterator = subject
        .takeUntil(controller, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      controller.next('end')
      expect(await iterator.next()).toEqual({
        done: true,
        value: {done: false, value: 'end'},
      })
    })

    it('should yield all items if the notifier does not resolve', async () => {
      const controller = new subject.Subject()
      const iterator = subject
        .takeUntil(controller, asAsync('one', 'two', 'three'))
        [Symbol.asyncIterator]()

      expect(await iterator.next()).toEqual({
        done: false,
        value: 'one',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'two',
      })
      expect(await iterator.next()).toEqual({
        done: false,
        value: 'three',
      })
      expect(await iterator.next()).toEqual({
        done: true,
        value: undefined,
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
