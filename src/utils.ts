import type {AsyncIterableOrIterator} from './async.js'
import type {IterableOrIterator} from './sync.js'

/**
 * @internal
 */
const isIterableOrIterator = (iterator: any): iterator is IterableOrIterator<unknown> | AsyncIterableOrIterator<unknown> => {
  return (
    iterator != null &&
    (typeof iterator[Symbol.iterator] === 'function' ||
      typeof iterator[Symbol.asyncIterator] === 'function' ||
      typeof iterator.next === 'function')
  )
}
/**
 * @internal
 */
export type Curry2<A, B, R> = {
  (a: A, b: B): R
  (a: A): (b: B) => R
}
/**
 * @internal
 */
export const curry2 = <A, B, R>(func: (a: A, b: B) => R): Curry2<A, B, R> =>
  ((a: A, b?: B) => {
    if (b === undefined) {
      return (b: B) => func(a, b)
    } else {
      return func(a, b)
    }
  }) as any
/**
 * @internal
 */
export function autoCurry(this: unknown, fn: Function): any {
  const args = Array.from(arguments)

  if (fn.length <= 1) return fn
  if (args.length - 1 >= fn.length) return fn.apply(this, args.slice(1))

  return function(this: unknown) {
    return autoCurry.apply(this, args.concat(Array.from(arguments)) as any)
  }
}
/**
 * @internal
 */
export type Curry2WithOptions<A, I, O, R> = {
  (a: A, b: I, options?: O): R
  (a: A, options: O | undefined): (b: I) => R
  (a: A): (b: I, options?: O | undefined) => R
}
/**
 * @internal
 */
export const curry2WithOptions = <
  A,
  I extends IterableOrIterator<any> | AsyncIterableOrIterator<any>,
  O,
  R
>(
  func: (a: A, b: I, options?: O) => R,
): Curry2WithOptions<A, I, O, R> =>
  ((a: A, b?: I, options?: O) => {
    if (options === undefined) {
      if (b === undefined) {
        return ((b: I, options?: O) => func(a, b, options)) as any
      } else {
        if (isIterableOrIterator(b)) {
          return func(a, b as I)
        } else {
          options = b
          return (b: I) => func(a, b, options)
        }
      }
    } else {
      return func(a, b!, options)
    }
  }) as any

export function pipeValue<V, R>(value: V, a: (a: V) => R): R
export function pipeValue<V, R, _A>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => R,
): R
export function pipeValue<V, R, _A, _B>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => R,
): R
export function pipeValue<V, R, _A, _B, _C>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G, _H>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G, _H, _I>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => R,
): R
export function pipeValue<V, R, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T,
  _U
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => _U,
  v: (v: _U) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T,
  _U,
  _V
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => _U,
  v: (v: _U) => _V,
  w: (w: _V) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T,
  _U,
  _V,
  _W
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => _U,
  v: (v: _U) => _V,
  w: (w: _V) => _W,
  x: (x: _W) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T,
  _U,
  _V,
  _W,
  _X
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => _U,
  v: (v: _U) => _V,
  w: (w: _V) => _W,
  x: (x: _W) => _X,
  y: (y: _X) => R,
): R
export function pipeValue<
  V,
  R,
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
  _I,
  _J,
  _K,
  _L,
  _M,
  _N,
  _O,
  _P,
  _Q,
  _R,
  _S,
  _T,
  _U,
  _V,
  _W,
  _X,
  _Y
>(
  value: V,
  a: (a: V) => _A,
  b: (b: _A) => _B,
  c: (c: _B) => _C,
  d: (d: _C) => _D,
  e: (e: _D) => _E,
  f: (f: _E) => _F,
  g: (g: _F) => _G,
  h: (h: _G) => _H,
  i: (i: _H) => _I,
  j: (j: _I) => _J,
  k: (k: _J) => _K,
  l: (l: _K) => _L,
  m: (m: _L) => _M,
  n: (n: _M) => _N,
  o: (o: _N) => _O,
  p: (p: _O) => _P,
  q: (q: _P) => _Q,
  r: (r: _Q) => _R,
  s: (s: _R) => _S,
  t: (t: _S) => _T,
  u: (u: _T) => _U,
  v: (v: _U) => _V,
  w: (w: _V) => _W,
  x: (x: _W) => _X,
  y: (y: _X) => _Y,
  z: (z: _Y) => R,
): R
export function pipeValue(
  value: any,
  ...functions: Array<(value: any) => any>
) {
  return functions.reduce((value, func) => func(value), value)
}

export function tuple<A>(items: [A]): [A]
export function tuple<A, B>(items: [A, B]): [A, B]
export function tuple<A, B, C>(items: [A, B, C]): [A, B, C]
export function tuple<A, B, C, D>(items: [A, B, C, D]): [A, B, C, D]
export function tuple<A, B, C, D, E>(items: [A, B, C, D, E]): [A, B, C, D, E]
export function tuple<A, B, C, D, E, F>(
  items: [A, B, C, D, E, F],
): [A, B, C, D, E, F]
export function tuple<A, B, C, D, E, F, G>(
  items: [A, B, C, D, E, F, G],
): [A, B, C, D, E, F, G]
export function tuple<A, B, C, D, E, F, G, H>(
  items: [A, B, C, D, E, F, G, H],
): [A, B, C, D, E, F, G, H]
export function tuple<A, B, C, D, E, F, G, H, I>(
  items: [A, B, C, D, E, F, G, H, I],
): [A, B, C, D, E, F, G, H, I]
/**
 * An identity function that is typed so that Typescript understands it passes through a tuple.
 *
 * ## Example
 * ```typescript
 * const isArray = ['hello', 42] // isArray has type Array<string|number>
 * const isTuple = tuple(['hello', 42]) // isTuple has type [string, number]
 * ```
 */
export function tuple(items: Array<any>) {
  return items
}

export const collectEntry = <K, V>(entry: [K, V]) => entry
