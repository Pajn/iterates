import curry from 'auto-curry'

/**
 * Either an Iterable (for example an Array) or an Iterator
 * (for example the result of a generator function)
 */
export type IterableOrIterator<T> = Iterable<T> | Iterator<T>
export type Ordering = number

/**
 * A helper function to turn an IterableOrIterator to an Iterable
 */
export const asIterable = <T>(iterator: IterableOrIterator<T>): Iterable<T> => {
  if (typeof iterator[Symbol.iterator] === 'undefined') {
    return {[Symbol.iterator]: () => iterator as Iterator<T>}
  } else {
    return iterator as Iterable<T>
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
  <T>(Iterator: IterableOrIterator<T>): IterableIterator<{
    index: number
    item: T
  }>
} = function enumerate<T>(
  iterator: IterableOrIterator<T>,
): IterableIterator<{
  index: number
  item: T
}> {
  let index = 0
  return map(
    item => ({
      index: index++,
      item,
    }),
    iterator,
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
  <T, U>(fn: (item: T) => U, iterator: IterableOrIterator<T>): IterableIterator<
    U
  >
  <T, U>(fn: (item: T) => U): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* map<T, U>(
  fn: (item: T) => U,
  iterator: IterableOrIterator<T>,
) {
  for (const item of asIterable(iterator)) {
    yield fn(item)
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
    fn: (item: T) => U | undefined,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<U>
  <T, U>(fn: (item: T) => U | undefined): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* filterMap<T, U>(
  fn: (item: T) => U | undefined,
  iterator: IterableOrIterator<T>,
) {
  for (const item of asIterable(iterator)) {
    const innerItem = fn(item)
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
    fn: (item: T) => IterableOrIterator<U>,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<U>
  <T, U>(fn: (item: T) => IterableOrIterator<U>): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* flatMap<T, U>(
  fn: (item: T) => IterableOrIterator<U>,
  iterator: IterableOrIterator<T>,
) {
  for (const item of asIterable(iterator)) {
    for (const innerItem of asIterable(fn(item))) {
      yield innerItem
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
  <T>(iterator: IterableOrIterator<IterableOrIterator<T>>): IterableIterator<T>
} = function* flatten<T>(iterator: IterableOrIterator<IterableOrIterator<T>>) {
  for (const item of asIterable(iterator)) {
    for (const innerItem of asIterable(item)) {
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
    predicate: (item: T) => boolean,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<T>
  <T>(predicate: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<T>
} = curry(function* filter<T>(
  predicate: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  for (const item of asIterable(iterator)) {
    if (predicate(item)) {
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
  <T>(fn: (item: T) => boolean, Iterator: IterableOrIterator<T>): T | undefined
  <T>(fn: (item: T) => boolean): (
    Iterator: IterableOrIterator<T>,
  ) => T | undefined
} = curry(function find<T>(
  fn: (item: T) => boolean,
  Iterator: IterableOrIterator<T>,
): T | undefined {
  for (const item of asIterable(Iterator)) {
    if (fn(item)) {
      return item
    }
  }
})

/**
 * Returns the first value of the iterator or undefined if it's empty
 */
export const first: {
  <T>(iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(iterator: IterableOrIterator<T>): T | undefined {
  for (const item of asIterable(iterator)) {
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
  <T>(count: number, iterator: IterableOrIterator<T>): IterableIterator<T>
  <T>(count: number): (iterator: IterableOrIterator<T>) => IterableIterator<T>
} = curry(function* find<T>(
  count: number,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  let index = 0
  for (const item of asIterable(iterator)) {
    if (index >= count) break
    yield item
    index++
  }
})

/**
 * Returns the last value of the iterator or undefined if it's empty
 */
export const last: {
  <T>(iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(iterator: IterableOrIterator<T>): T | undefined {
  let lastItem
  for (const item of asIterable(iterator)) {
    lastItem = item
  }
  return lastItem
}

export const sort: {
  <T>(fn: (a: T, b: T) => Ordering, iterator: IterableOrIterator<T>): Array<T>
  <T>(fn: (a: T, b: T) => Ordering): (
    iterator: IterableOrIterator<T>,
  ) => Array<T>
} = curry(function sort<T>(
  fn: (a: T, b: T) => Ordering,
  iterator: IterableOrIterator<T>,
): Array<T> {
  const items = [...asIterable(iterator)]
  items.sort(fn)
  return items
})
