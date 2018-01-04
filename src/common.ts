export type IterableOrIterator<T> = Iterable<T> | Iterator<T>

export const asIterable = <T>(iterator: IterableOrIterator<T>): Iterable<T> => {
  if (typeof iterator[Symbol.iterator] === 'undefined') {
    return {[Symbol.iterator]: () => iterator as Iterator<T>}
  } else {
    return iterator as Iterable<T>
  }
}
