import curry from 'auto-curry'
import {EventEmitter} from 'events'
import {IterableOrIterator, asIterable as asSyncIterable} from './sync'

if (Symbol.asyncIterator === undefined) {
  ;(Symbol as any).asyncIterator = Symbol()
}

export type Awaitable<T> = T | PromiseLike<T>
/**
 * Either an AsyncIterable or an AsyncIterator
 */
export type AsyncIterableOrIterator<T> =
  | AsyncIterable<Awaitable<T>>
  | AsyncIterator<Awaitable<T>>
/** @internal */
export type AnyIterableOrIterator<T> =
  | IterableOrIterator<T>
  | AsyncIterableOrIterator<T>

/** @internal */
export const asIterable = <T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterable<T> => {
  if (typeof asyncIterator[Symbol.asyncIterator] === 'undefined') {
    return {[Symbol.asyncIterator]: () => asyncIterator as AsyncIterator<T>}
  } else {
    return asyncIterator as AsyncIterable<T>
  }
}
/**
 * Turns a syncronous Iterable or Iterator to an asyncronous Iterable.
 */
export async function* asAsyncIterable<T>(
  iterator: IterableOrIterator<T>,
): AsyncIterable<T> {
  for (const value of asSyncIterable(iterator)) {
    yield value
  }
}
/**
 * Collect all values of the iterator in an Array.
 */
export async function asArray<T>(
  iterator: AsyncIterableOrIterator<T>,
): Promise<Array<T>> {
  const array: Array<T> = []
  for await (const value of asIterable(iterator)) {
    array.push(value)
  }
  return array
}
/**
 * Creates in iterable that yields and then ends when the promise resolves
 */
export async function* fromPromise<T>(
  promise: Promise<T>,
): AsyncIterableIterator<T> {
  yield await promise
}

class Subscriber<T, E> {
  items: Array<{done: boolean; isError: boolean; value?: T; error?: E}> = []
  eventEmitter = new EventEmitter()
  iterator: AsyncIterator<T>

  constructor(private dispose: () => void) {
    let lastNext: Promise<any> = Promise.resolve()
    this.iterator = {
      next: async () => {
        await lastNext
        return (lastNext = new Promise<IteratorResult<T>>((resolve, reject) => {
          if (this.items.length > 0) {
            const item = this.items.shift()!
            if (item.isError) {
              reject(item.error)
            } else {
              resolve({done: item.done, value: item.value!})
            }
            return
          }

          this.eventEmitter.once('value', () => {
            const item = this.items.shift()!
            if (item.isError) {
              reject(item.error)
            } else {
              resolve({done: item.done, value: item.value!})
            }
          })
        }))
      },
    }
  }

  pushNext(item: T) {
    this.items.push({done: false, isError: false, value: item})
    this.eventEmitter.emit('value')
  }
  pushThrow(error: E) {
    this.items.push({done: false, isError: true, error})
    this.dispose()
    this.eventEmitter.emit('value')
  }
  done() {
    this.items.push({done: true, isError: false})
    this.dispose()
    this.eventEmitter.emit('value')
  }
}

export interface ISubject<T, E = any> extends AsyncIterable<T> {
  /**
   * Push an item into the subject to yield to iterators
   */
  next(item: T): void
  /**
   * Throw an error to the iterators
   */
  throw(err: E): void
  /**
   * Ends the iterators
   *
   * Efter calling done the Subject is dispased and can no longer be used
   */
  done(): void
}

/**
 * A Subject is an AsyncIterable wich yields values that are pushed to the Subject.
 *
 * The Subject can be seen as an EventEmitter, allowing a producer to
 * push values to one or more consumers
 *
 * ## Example
 * ```typescript
 * const timestamps = new Subject<Date>()
 *
 * setInterval(() => timestamps.next(new Date()), 1000)
 *
 * for await (const timestamp of timestamps) {
 *   console.log(timestamp); // Will log the current time every second
 * }
 * ```
 */
export class Subject<T, E = any> implements ISubject<T, E> {
  private _subscribers = new Set<Subscriber<T, E>>()
  private _isDisposed = false

  private _checkDisposed() {
    if (this._isDisposed) throw Error('The Subject have been disposed')
  }

  /**
   * Push an item into the subject to yield to iterators
   */
  public next(item: T) {
    this._checkDisposed()
    for (const subscriber of this._subscribers) {
      subscriber.pushNext(item)
    }
  }
  /**
   * Throw an error to the iterators
   */
  public throw(error: E) {
    this._checkDisposed()
    for (const subscriber of this._subscribers) {
      subscriber.pushThrow(error)
    }
    this._subscribers.clear()
  }
  /**
   * Ends the iterators
   *
   * Efter calling done the Subject is dispased and can no longer be used
   */
  public done() {
    this._checkDisposed()
    for (const subscriber of this._subscribers) {
      subscriber.done()
    }
    this._subscribers.clear()
    this._isDisposed = true
  }

  [Symbol.asyncIterator]() {
    const subscriber = new Subscriber<T, E>(() => {
      this._subscribers.delete(subscriber)
    })
    this._subscribers.add(subscriber)
    return subscriber.iterator
  }
}

/**
 * Creates an iterator which gives the current iteration count
 * as well as the next value.
 *
 * The iterator returned yields objects of {index, item}, where index is the
 * current index of iteration and item is the value returned by the iterator.
 *
 * ## Example
 * ```typescript
 * [...enumerate(['a', 'b', 'c'])]
 * // [{index: 0, item: 'a'}, {index: 1, item: 'b'}, {index: 2, item: 'c'}]
 * ```
 */
export const enumerate: {
  <T>(asyncIterator: AsyncIterableOrIterator<T>): AsyncIterableIterator<{
    index: number
    item: T
  }>
} = function enumerate<T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<{
  index: number
  item: T
}> {
  let index = 0
  return map(
    item => ({
      index: index++,
      item,
    }),
    asyncIterator,
  )
}

/**
 * Calls fn for every item in the iterator to produce an iterator
 * with the results of fn(item)
 *
 * ## Example
 * ```typescript
 * [...map(e => e*e), [1, 2, 3]] // [1, 4, 9]
 * ```
 */
export const map: {
  <T, U>(
    fn: (item: T) => Awaitable<U>,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => Awaitable<U>): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<U>
} = curry(async function* map<T, U>(
  fn: (item: T) => Awaitable<U>,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<U> {
  for await (const item of asIterable(asyncIterator)) {
    yield await fn(item)
  }
})

/**
 * Like map but filter out undefined results
 *
 * ## Example
 * ```typescript
 * [...flatMap(e => e % 2 === 0 ? undefined : e*e), [1, 2, 3]] // [1, 9]
 * ```
 *
 * ## Why not map(filter())?
 * filterMap is functionally equivalent to map(filter()) but can give
 * cleaner code and higher performance for cases where filtering is applied
 * to the mapped value and not the input value.
 */
export const filterMap: {
  <T, U>(
    fn: (item: T) => Awaitable<U | undefined>,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => Awaitable<U | undefined>): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<U>
} = curry(async function* filterMap<T, U>(
  fn: (item: T) => Awaitable<U | undefined>,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<U> {
  for await (const item of asIterable(asyncIterator)) {
    const innerItem = await fn(item)
    if (innerItem !== undefined) {
      yield innerItem
    }
  }
})

/**
 * Like map but flattens the result a single level
 *
 * ## Example
 * ```typescript
 * [...flatMap(e => [e, e*e]), [1, 2, 3]] // [1, 1, 2, 4, 3, 9]
 * ```
 */
export const flatMap: {
  <T, U>(
    fn: (item: T) => AsyncIterableOrIterator<U>,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => AsyncIterableOrIterator<U>): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<U>
} = curry(async function* flatMap<T, U>(
  fn: (item: T) => AsyncIterableOrIterator<U>,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<U> {
  for await (const item of asIterable(asyncIterator)) {
    for await (const innerItem of asIterable(fn(item))) {
      yield await innerItem
    }
  }
})

/**
 * Flattens an iterator a single level
 *
 * ## Example
 * ```typescript
 * [...flatten([[1, 2], [], [3]])] // [1, 2, 3]
 * ```
 */
export const flatten: {
  <T>(
    asyncIterator: AsyncIterableOrIterator<AsyncIterableOrIterator<T>>,
  ): AsyncIterableIterator<T>
} = async function* flatten<T>(
  asyncIterator: AsyncIterableOrIterator<AsyncIterableOrIterator<T>>,
): AsyncIterableIterator<T> {
  for await (const item of asIterable(asyncIterator)) {
    for await (const innerItem of asIterable(item)) {
      yield innerItem
    }
  }
}

/**
 * Calls predicate for every item in the iterator to produce an iterator
 * with only the items for which predicate returns true
 *
 * ## Example
 * ```typescript
 * [...filter(e => e > 2), [1, 2, 3]] // [2, 3]
 * ```
 */
export const filter: {
  <T>(
    fn: (item: T) => boolean,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<T>
  <T>(fn: (item: T) => boolean): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<T>
} = curry(async function* filter<T>(
  fn: (item: T) => boolean,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<T> {
  for await (const item of asIterable(asyncIterator)) {
    if (fn(item)) {
      yield item
    }
  }
})

/**
 * Reduces an iterator to a single value by iteratively combining each
 * item of the iterator with an existing value
 *
 * Uses initialValue as the initial value, then iterates through the elements
 * and updates the value with each element using the combine function.
 *
 * If the iterator is empty, the initialValue is returned.
 *
 * ## Example
 * ```typescript
 * fold(0, (sum, item) => sum + item, [1, 2, 3]) // 6
 * ```
 */
export const fold: {
  <T, U>(
    initialValue: U,
    combine: (previousItem: U, item: T) => Awaitable<U>,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): Promise<U>
  <T, U>(initialValue: U, combine: (previousItem: U, item: T) => U): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => Promise<U>
} = curry(async function fold<T, U>(
  initialValue: U,
  combine: (previousItem: U, item: T) => U,
  asyncIterator: AsyncIterableOrIterator<T>,
): Promise<U> {
  let value = initialValue
  for await (const item of asIterable(asyncIterator)) {
    value = combine(value, await item)
  }
  return value
})

/**
 * Zips two iterators by taking the next value of each iterator as a tuple
 *
 * If the two iterators have a different length, it will zip until the first iterator ends
 * and then end with a return value of the longer iterator.
 *
 * ## Example
 * ```typescript
 * [...zip([1, 2, 3], ['a', 'b', 'c']) // [[1, 'a'], [2, 'b'], [3, 'c']]
 * ```
 */
export const zip: {
  <A, B>(
    a: AsyncIterableOrIterator<A>,
    b: AsyncIterableOrIterator<B>,
  ): AsyncIterableIterator<[A, B]>
  <A, B>(a: AsyncIterableOrIterator<A>): (
    b: AsyncIterableOrIterator<B>,
  ) => AsyncIterableIterator<[A, B]>
} = curry(async function* zip<A, B>(
  a: AsyncIterableOrIterator<A>,
  b: AsyncIterableOrIterator<B>,
): AsyncIterableIterator<[A, B]> {
  const iterableA = asIterable(a)
  const iteratorB = asIterable(b)[Symbol.asyncIterator]()
  for await (const itemA of iterableA) {
    const {done, value: itemB} = await iteratorB.next()
    if (done) {
      return a
    } else {
      yield [await itemA, await itemB]
    }
  }

  const {done} = await iteratorB.next()
  if (!done) return b
})

/**
 * Creates an iterator that only yields the first item yielded by the source
 * iterator during a window lasting the specified duration
 *
 * ## Example
 * ```typescript
 * const timestamps = new Subject<Date>()
 * const throttledTimestamps = throttle(2000, timestamps)
 *
 * setInterval(() => timestamps.next(new Date()), 1000)
 *
 * for await (const timestamp of throttledTimestamps) {
 *   console.log(timestamp); // Will log the current time every other second
 * }
 * ```
 */
export const throttle: {
  <T>(
    duration: number,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<T>
  <T>(duration: number): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<T>
} = curry(async function* throttle<T>(
  duration: number,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<T> {
  let hasItem = false
  let lastItem: T | undefined = undefined
  let lastYield = 0
  for await (const item of asIterable(asyncIterator)) {
    const now = Date.now()
    if (lastYield === 0 || now - lastYield >= duration) {
      hasItem = false
      lastItem = undefined
      lastYield = now
      yield item
    } else {
      lastItem = item
      hasItem = true
    }
  }
  if (hasItem) {
    yield lastItem!
  }
})

/**
 * Calls fn for every item and returns the first item for which fn returns true
 *
 * Returns undefined if fn return fals for all items or if the iterator is empty
 *
 * ## Example
 * ```typescript
 * [...find(e => e > 1, [1, 2, 3])] // 2
 * ```
 */
export const find: {
  <T>(
    fn: (item: T) => boolean,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): Promise<T | undefined>
  <T>(fn: (item: T) => boolean): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => Promise<T | undefined>
} = curry(async function find<T>(
  fn: (item: T) => boolean,
  asyncIterator: AsyncIterableOrIterator<T>,
): Promise<T | undefined> {
  for await (const item of asIterable(asyncIterator)) {
    if (fn(item)) {
      return item
    }
  }
})

/**
 * Returns the first value of the iterator or undefined if it's empty
 *
 * ## Example
 * ```typescript
 * first([1, 2, 3]) // 1
 * ```
 */
export const first: {
  <T>(asyncIterator: AsyncIterableOrIterator<T>): Promise<T | undefined>
} = async function first<T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): Promise<T | undefined> {
  for await (const item of asIterable(asyncIterator)) {
    return item
  }
}

/**
 * Returns an iterator with the first count values of the iterator
 *
 * The returned iterator may hold fewer than `count` values if the
 * iterator contains less items than `count`
 *
 * ## Example
 * ```typescript
 * take(2, [1, 2, 3]) // [1, 2]
 * ```
 */
export const take: {
  <T>(
    count: number,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<T>
  <T>(count: number): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<T>
} = curry(async function* find<T>(
  count: number,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<T> {
  let index = 0
  for await (const item of asIterable(asyncIterator)) {
    if (index >= count) break
    yield item
    index++
  }
})

/**
 * Yields values until the notifier iterable yields a value
 */
export const takeUntil: {
  <T>(
    notifier: AsyncIterableOrIterator<any>,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableOrIterator<T>
  <T>(notifier: AsyncIterableOrIterator<any>): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<T>
} = curry(async function* find<T>(
  notifier: AsyncIterableOrIterator<any>,
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterableIterator<T> {
  let didResolve = false
  const returnValue = asIterable(notifier)
    [Symbol.asyncIterator]()
    .next()
    .then(returnValue => {
      didResolve = true
      return returnValue
    })
  for await (const item of asIterable(asyncIterator)) {
    if (didResolve) break
    yield item
  }
  if (didResolve) {
    return await returnValue
  }
})

/**
 * Returns the last value of the iterator or undefined if it's empty
 *
 * ## Example
 * ```typescript
 * last([1, 2, 3]) // 3
 * ```
 */
export const last: {
  <T>(asyncIterator: AsyncIterableOrIterator<T>): Promise<T | undefined>
} = async function first<T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): Promise<T | undefined> {
  let lastItem
  for await (const item of asIterable(asyncIterator)) {
    lastItem = item
  }
  return lastItem
}
