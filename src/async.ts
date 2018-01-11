import curry from 'auto-curry'
import {IterableOrIterator} from './sync'

export type Awaitable<T> = T | PromiseLike<T>
export type AsyncIterableOrIterator<T> = AsyncIterable<T> | AsyncIterator<T>
export type AnyIterableOrIterator<T> =
  | IterableOrIterator<T>
  | AsyncIterableOrIterator<T>

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
    asyncIterator: AsyncIterableOrIterator<Awaitable<T>>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => Awaitable<U | undefined>): (
    asyncIterator: AsyncIterableOrIterator<Awaitable<T>>,
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
    fn: (item: T) => AsyncIterableOrIterator<Awaitable<U>>,
    asyncIterator: AsyncIterableOrIterator<Awaitable<T>>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => AsyncIterableOrIterator<Awaitable<U>>): (
    asyncIterator: AsyncIterableOrIterator<Awaitable<T>>,
  ) => AsyncIterableIterator<U>
} = curry(async function* flatMap<T, U>(
  fn: (item: T) => AsyncIterableOrIterator<Awaitable<U>>,
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
 * Calls fn for every item and returns the first item for which fn returns true
 *
 * Returns undefined if fn return fals for all items or if the iterator is empty
 *
 * ## Example
 * ```typescript
 * [...find(e => e > 1), [1, 2, 3]] // 2
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
 */
export const take: {
  <T>(count: number, asyncIterator: AsyncIterableOrIterator<T>): Promise<
    T | undefined
  >
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
 * Returns the last value of the iterator or undefined if it's empty
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
