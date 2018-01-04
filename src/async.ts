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
