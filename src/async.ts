import curry from 'auto-curry'

export type AsyncIterableOrIterator<T> = AsyncIterable<T> | AsyncIterator<T>

export const asIterable = <T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): AsyncIterable<T> => {
  if (typeof asyncIterator[Symbol.asyncIterator] === 'undefined') {
    return {[Symbol.asyncIterator]: () => asyncIterator as AsyncIterator<T>}
  } else {
    return asyncIterator as AsyncIterable<T>
  }
}

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

export const map: {
  <T, U>(
    fn: (item: T) => U,
    asyncIterator: AsyncIterableOrIterator<T>,
  ): AsyncIterableIterator<U>
  <T, U>(fn: (item: T) => U): (
    asyncIterator: AsyncIterableOrIterator<T>,
  ) => AsyncIterableIterator<U>
} = curry(async function* map<T, U>(
  fn: (item: T) => U,
  asyncIterator: AsyncIterableOrIterator<T>,
) {
  for await (const item of asIterable(asyncIterator)) {
    yield fn(item)
  }
})

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
) {
  for await (const item of asIterable(asyncIterator)) {
    for await (const innerItem of asIterable(fn(item))) {
      yield innerItem
    }
  }
})

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

export const first: {
  <T>(asyncIterator: AsyncIterableOrIterator<T>): Promise<T | undefined>
} = async function first<T>(
  asyncIterator: AsyncIterableOrIterator<T>,
): Promise<T | undefined> {
  for await (const item of asIterable(asyncIterator)) {
    return item
  }
}

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
