import curry from 'auto-curry'

export type IterableOrIterator<T> = Iterable<T> | Iterator<T>
export type Ordering = number

export const asIterable = <T>(iterator: IterableOrIterator<T>): Iterable<T> => {
  if (typeof iterator[Symbol.iterator] === 'undefined') {
    return {[Symbol.iterator]: () => iterator as Iterator<T>}
  } else {
    return iterator as Iterable<T>
  }
}

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

export const flatten: {
  <T>(iterator: IterableOrIterator<IterableOrIterator<T>>): IterableIterator<T>
} = function* flatten<T>(iterator: IterableOrIterator<IterableOrIterator<T>>) {
  for (const item of asIterable(iterator)) {
    for (const innerItem of asIterable(item)) {
      yield innerItem
    }
  }
}

export const filter: {
  <T>(
    fn: (item: T) => boolean,
    iterator: IterableOrIterator<T>,
  ): IterableIterator<T>
  <T>(fn: (item: T) => boolean): (
    iterator: IterableOrIterator<T>,
  ) => IterableIterator<T>
} = curry(function* filter<T>(
  fn: (item: T) => boolean,
  iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  for (const item of asIterable(iterator)) {
    if (fn(item)) {
      yield item
    }
  }
})

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

export const first: {
  <T>(iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(iterator: IterableOrIterator<T>): T | undefined {
  for (const item of asIterable(iterator)) {
    return item
  }
}

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
