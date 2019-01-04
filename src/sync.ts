import curry from 'auto-curry'
import {curry2WithOptions} from './utils'

/**
 * Either an Iterable (for example an Array) or an Iterator
 * (for example the result of a generator function)
 */
export type IterableOrIterator<T> = Iterable<T> | Iterator<T>
export type Ordering = number

/**
 * @internal
 */
export const asIterable = <T>(iterator: IterableOrIterator<T>): Iterable<T> => {
  if (typeof iterator[Symbol.iterator] === 'undefined') {
    return {[Symbol.iterator]: () => iterator as Iterator<T>}
  } else {
    return iterator as Iterable<T>
  }
}
/**
 * Collect all values of the iterator in an Array.
 */
export function asArray<T>(iterator: IterableOrIterator<T>): Array<T> {
  return [...asIterable(iterator)]
}

/**
 * Creates an iterator with values from `start` to `end`.
 *
 * If end is undefined, the iterator will have an infinite length.
 * If end is equal to start, no value will be emitted.
 *
 * The iterator will step with the specified `step` size which defaults to `1`.
 * The step size can be set to negative if the start value is higher than the end value
 *
 * The iterator will end with a return value of the value following the end value.
 *
 * ## Examples
 * ```typescript
 * [...range({start: 0, end: 3})] // [0, 1, 2]
 * [...range({start: 3, end: 2, step: -1})] // [2, 1, 0]
 * [...range({start: 0})] // (0, 1, 2, 3, 4, ...)
 * [...range({start: 0, step: -2})] // (0, -2, -4, -6, -8, ...)
 * ```
 */
export function* range({
  start,
  end,
  step = 1,
}: {
  start: number
  end?: number
  step?: number
}) {
  if (start === end) return start

  let value = start
  while (true) {
    yield value
    value += step
    if (end !== undefined) {
      if (start < end) {
        if (value >= end) return value
      } else {
        if (value <= end) return value
      }
    }
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
  <T>(iterator: IterableOrIterator<T>): IterableIterator<{
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
 * [...filter(e => e > 2, [1, 2, 3])] // [2, 3]
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
    combine: (previousItem: U, item: T) => U,
    iterator: IterableOrIterator<T>,
  ): U
  <T, U>(initialValue: U, combine: (previousItem: U, item: T) => U): (
    iterator: IterableOrIterator<T>,
  ) => U
} = curry(function fold<T, U>(
  initialValue: U,
  combine: (previousItem: U, item: T) => U,
  iterator: IterableOrIterator<T>,
): U {
  let value = initialValue
  for (const item of asIterable(iterator)) {
    value = combine(value, item)
  }
  return value
})

/**
 * Like fold, scan iteratively combines each item of the iterator with
 * an existing value. Scan does however yield each intermediate value.
 *
 * If the iterator is empty, no value is yielded.
 *
 * ## Example
 * ```typescript
 * scan(0, (sum, item) => sum + item, [1, 2, 3]) // [1, 3, 6]
 * ```
 */
export const scan: {
  <T, U>(
    initialValue: U,
    combine: (previousItem: U, item: T) => U,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<U>
  <T, U>(initialValue: U, combine: (previousItem: U, item: T) => U): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* scan<T, U>(
  initialValue: U,
  combine: (previousItem: U, item: T) => U,
  iterator: IterableOrIterator<T>,
): IterableIterator<U> {
  let value = initialValue
  for (const item of asIterable(iterator)) {
    value = combine(value, item)
    yield value
  }
  return value
})

/**
 * Transforms an iterator into a Map.
 *
 * Calls `fn` for every item in the iterator. `fn` should return a tuple of `[key, value]`
 * for that item.
 *
 * If multiple items returns the same key the latter will overwrite the former.
 * This behavior can be changed by passing `merge` in the options object.
 *
 * `merge` takes the current value, the new value and the key and should return a combined
 * value. It can also throw to dissallow multiple items returning the same key.
 *
 * ## Example
 * ```typescript
 * collect(e => [e, e*e], [1, 2, 3]) // Map {1 => 1, 2 => 4, 3 => 9}
 * ```
 *
 * ### Using merge
 * ```typescript
 * collect(
 *   e => [e % 2 === 0 ? 'even' : 'odd', [e]],
 *   [1, 2, 3],
 *   {merge: (a, b) => a.concat(b)}
 * )
 * // Map {'odd' => [1, 3], 'even' => [2]}
 * ```
 */
export const collect: {
  <T, U, K = string>(
    fn: (item: T) => [K, U],
    iterator: IterableOrIterator<T>,
    options?: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ): Map<K, U>
  <T, U, K = string>(
    fn: (item: T) => [K, U],
    options: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ): (iterator: IterableOrIterator<T>) => Map<K, U>
  <T, U, K = string>(fn: (item: T) => [K, U]): (
    iterator: IterableOrIterator<T>,
    options?: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ) => Map<K, U>
} = curry2WithOptions(function collect<T, U, K = string>(
  fn: (item: T) => [K, U],
  iterator: IterableOrIterator<T>,
  {merge}: {merge?: (currentValue: U, newValue: U, key: K) => U} = {},
): Map<K, U> {
  const collection = new Map<K, U>()

  for (const item of asIterable(iterator)) {
    const [key, value] = fn(item)
    if (merge !== undefined && collection.has(key)) {
      collection.set(key, merge(collection.get(key)!, value, key))
    } else {
      collection.set(key, value)
    }
  }

  return collection
})

/**
 * Transforms an iterator into an Object.
 *
 * Calls `fn` for every item in the iterator. `fn` should return a tuple of `[key, value]`
 * for that item.
 *
 * If multiple items returns the same key the latter will overwrite the former.
 * This behavior can be changed by passing `merge` in the options object.
 *
 * `merge` takes the current value, the new value and the key and should return a combined
 * value. It can also throw to dissallow multiple items returning the same key.
 *
 * ## Example
 * ```typescript
 * collectRecord(e => [e, e*e], [1, 2, 3]) // {1: 1, 2: 4, 3: 9}
 * ```
 *
 * ### Using merge
 * ```typescript
 * collect(
 *   e => [e % 2 === 0 ? 'even' : 'odd', [e]],
 *   [1, 2, 3],
 *   {merge: (a, b) => a.concat(b)}
 * )
 * // {odd: [1, 3], even: [2]}
 * ```
 */
export const collectRecord: {
  <T, U, K extends string>(
    fn: (item: T) => [K, U],
    iterator: IterableOrIterator<T>,
    options?: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ): Record<K, U>
  <T, U, K extends string>(
    fn: (item: T) => [K, U],
    options: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ): (iterator: IterableOrIterator<T>) => Record<K, U>
  <T, U, K extends string>(fn: (item: T) => [K, U]): (
    iterator: IterableOrIterator<T>,
    options?: {merge?: (currentValue: U, newValue: U, key: K) => U},
  ) => Record<K, U>
} = curry2WithOptions(function collect<T, U, K extends string>(
  fn: (item: T) => [K, U],
  iterator: IterableOrIterator<T>,
  {merge}: {merge?: (currentValue: U, newValue: U, key: K) => U} = {},
): Record<K, U> {
  const record: Record<K, U> = {} as any

  for (const item of asIterable(iterator)) {
    const [key, value] = fn(item)
    if (merge !== undefined && key in record) {
      record[key] = merge(record[key], value, key)
    } else {
      record[key] = value
    }
  }

  return record
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
  <A, B>(a: IterableOrIterator<A>, b: IterableOrIterator<B>): IterableIterator<
    [A, B]
  >
  <A, B>(a: IterableOrIterator<A>): (
    b: IterableOrIterator<B>,
  ) => IterableIterator<[A, B]>
} = curry(function* zip<A, B>(
  a: IterableOrIterator<A>,
  b: IterableOrIterator<B>,
): IterableIterator<[A, B]> {
  const iterableA = asIterable(a)
  const iteratorB = asIterable(b)[Symbol.iterator]()
  for (const itemA of iterableA) {
    const {done, value: itemB} = iteratorB.next()
    if (done) {
      return a
    } else {
      yield [itemA, itemB]
    }
  }

  const {done} = iteratorB.next()
  if (!done) return b
})

/**
 * Returns true if fn returns true for every item in the iterator
 *
 * Returns true if the iterator is empty
 *
 * ## Example
 * ```typescript
 * all(e => e > 1, [1, 2, 3]) // false
 * all(e => e > 0, [1, 2, 3]) // true
 * all(e => e > 1, [])        // true
 * ```
 */
export const all: {
  <T>(fn: (item: T) => boolean, iterator: IterableOrIterator<T>): boolean
  <T>(fn: (item: T) => boolean): (iterator: IterableOrIterator<T>) => boolean
} = curry(function all<T>(
  fn: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): boolean {
  for (const item of asIterable(iterator)) {
    if (!fn(item)) {
      return false
    }
  }

  return true
})

/**
 * Returns true if fn returns true for any item in the iterator
 *
 * Returns false if the iterator is empty
 *
 * ## Example
 * ```typescript
 * any(e => e > 1, [1, 2, 3]) // true
 * any(e => e > 3, [1, 2, 3]) // false
 * any(e => e > 1, [])        // false
 * ```
 */
// tslint:disable-next-line:variable-name
export const any: {
  <T>(fn: (item: T) => boolean, iterator: IterableOrIterator<T>): boolean
  <T>(fn: (item: T) => boolean): (iterator: IterableOrIterator<T>) => boolean
} = curry(function any<T>(
  fn: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): boolean {
  for (const item of asIterable(iterator)) {
    if (fn(item)) {
      return true
    }
  }

  return false
})

/**
 * Calls fn for every item and returns the first item for which fn returns true
 *
 * Returns undefined if fn return fals for all items or if the iterator is empty
 *
 * ## Example
 * ```typescript
 * find(e => e > 1, [1, 2, 3]) // 2
 * ```
 */
export const find: {
  <T>(fn: (item: T) => boolean, iterator: IterableOrIterator<T>): T | undefined
  <T>(fn: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => T | undefined
} = curry(function find<T>(
  fn: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): T | undefined {
  for (const item of asIterable(iterator)) {
    if (fn(item)) {
      return item
    }
  }
})

/**
 * Consumes an iterator, creating two Arrays from it
 *
 * The predicate passed to partition() can return true, or false.
 * partition() returns a pair, all of the elements for which it returned
 * true, and all of the elements for which it returned false.
 *
 * ## Example
 * ```typescript
 * const [even, odd] = partition(e => e % 2 === 0, [1, 2, 3])
 *
 * expect(even).toEqual([2])
 * expect(odd).toEqual([1, 3])
 * ```
 */
export const partition: {
  <T>(fn: (item: T) => boolean, iterator: IterableOrIterator<T>): [
    Array<T>,
    Array<T>
  ]
  <T>(fn: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => [Array<T>, Array<T>]
} = curry(function partition<T>(
  fn: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): [Array<T>, Array<T>] {
  const passing: Array<T> = []
  const failing: Array<T> = []

  for (const item of asIterable(iterator)) {
    if (fn(item)) {
      passing.push(item)
    } else {
      failing.push(item)
    }
  }

  return [passing, failing]
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
  <T>(iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(iterator: IterableOrIterator<T>): T | undefined {
  for (const item of asIterable(iterator)) {
    return item
  }
}

/**
 * Returns an iterator that provides all but the first count items.
 *
 * If the iterator has fewer than count items, then the resulting iterator is empty.
 *
 * The count must not be negative.
 *
 * ## Example
 * ```typescript
 * skip(2, [1, 2, 3]) // [3]
 * ```
 */
export const skip: {
  <T>(count: number, iterator: IterableOrIterator<T>): IterableIterator<T>
  <T>(count: number): (iterator: IterableOrIterator<T>) => IterableIterator<T>
} = curry(function* skip<T>(
  count: number,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  let index = 0
  for (const item of asIterable(iterator)) {
    if (index >= count) yield item
    else index++
  }
})

/**
 * Returns an iterator that skips leading items while test is satisfied.
 *
 * The returned iterator yields items from the passed iterator,
 * but skipping over all initial items where `test(item)` returns `true`.
 * If all items satisfy test the resulting iterator is empty, otherwise
 * it iterates the remaining items in their original order, starting with
 * the first item for which `test(item)` returns `false`.
 *
 * ## Example
 * ```typescript
 * skipWhile(item => item < 3, [1, 2, 3]) // [3]
 * ```
 */
export const skipWhile: {
  <T>(
    test: (item: T) => boolean,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<T>
  <T>(test: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<T>
} = curry(function* skipWhile<T>(
  test: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  let doYield = false
  for (const item of asIterable(iterator)) {
    if (doYield) yield item
    else if (!test(item)) {
      doYield = true
      yield item
    }
  }
})

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
  <T>(count: number, iterator: IterableOrIterator<T>): IterableIterator<T>
  <T>(count: number): (iterator: IterableOrIterator<T>) => IterableIterator<T>
} = curry(function* take<T>(
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
 * Returns an iterator of the leading items satisfying test.
 *
 * The returned iterator will yield items from the passed iterator until
 * test returns `false`. At that point, the returned iterator stops.
 *
 * ## Example
 * ```typescript
 * takeWhile(item => item < 3, [1, 2, 3]) // [1, 2]
 * ```
 */
export const takeWhile: {
  <T>(
    test: (item: T) => boolean,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<T>
  <T>(test: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<T>
} = curry(function* takeWhile<T>(
  test: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  for (const item of asIterable(iterator)) {
    if (!test(item)) break
    yield item
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
