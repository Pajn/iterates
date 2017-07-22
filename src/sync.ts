import curry from 'auto-curry'

export type IterableOrIterator<T> = Iterable<T> | Iterator<T>

export const asIterable = <T>(Iterator: IterableOrIterator<T>): Iterable<T> => {
  if (typeof Iterator[Symbol.iterator] === 'undefined') {
    return {[Symbol.iterator]: () => Iterator as Iterator<T>}
  } else {
    return Iterator as Iterable<T>
  }
}

export const enumerate: {
  <T>(Iterator: IterableOrIterator<T>): IterableIterator<{
    index: number
    item: T
  }>
} = function enumerate<T>(
  Iterator: IterableOrIterator<T>,
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
    Iterator,
  )
}

export const map: {
  <T, U>(fn: (item: T) => U, Iterator: IterableOrIterator<T>): IterableIterator<
    U
  >
  <T, U>(fn: (item: T) => U): (
    Iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* map<T, U>(
  fn: (item: T) => U,
  Iterator: IterableOrIterator<T>,
) {
  for (const item of asIterable(Iterator)) {
    yield fn(item)
  }
})

export const flatMap: {
  <T, U>(
    fn: (item: T) => IterableOrIterator<U>,
    Iterator: IterableOrIterator<T>,
  ): IterableIterator<U>
  <T, U>(fn: (item: T) => IterableOrIterator<U>): (
    Iterator: IterableOrIterator<T>,
  ) => IterableIterator<U>
} = curry(function* flatMap<T, U>(
  fn: (item: T) => IterableOrIterator<U>,
  Iterator: IterableOrIterator<T>,
) {
  for (const item of asIterable(Iterator)) {
    for (const innerItem of asIterable(fn(item))) {
      yield innerItem
    }
  }
})

export const filter: {
  <T>(
    fn: (item: T) => boolean,
    Iterator: IterableOrIterator<T>,
  ): IterableIterator<T>
  <T>(fn: (item: T) => boolean): (
    Iterator: IterableOrIterator<T>,
  ) => IterableIterator<T>
} = curry(function* filter<T>(
  fn: (item: T) => boolean,
  Iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  for (const item of asIterable(Iterator)) {
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
  <T>(Iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(Iterator: IterableOrIterator<T>): T | undefined {
  for (const item of asIterable(Iterator)) {
    return item
  }
}

export const take: {
  <T>(count: number, Iterator: IterableOrIterator<T>): IterableIterator<T>
  <T>(count: number): (Iterator: IterableOrIterator<T>) => IterableIterator<T>
} = curry(function* find<T>(
  count: number,
  Iterator: IterableOrIterator<T>,
): IterableIterator<T> {
  let index = 0
  for (const item of asIterable(Iterator)) {
    if (index >= count) break
    yield item
    index++
  }
})

export const last: {
  <T>(Iterator: IterableOrIterator<T>): T | undefined
} = function first<T>(Iterator: IterableOrIterator<T>): T | undefined {
  let lastItem
  for (const item of asIterable(Iterator)) {
    lastItem = item
  }
  return lastItem
}
