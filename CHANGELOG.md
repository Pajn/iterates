# 2.0.0

- Require an enivronment that supports `for await` natively. This should
  be all evergreen browsers and node version >= 10
- The shorthand imports `iterates/sync` and `iterates/async` require node version >= 12.7

# 1.2.2

- Fix missing js files in cjs and missing map files in lib

# 1.2.1

- Also link typings file from sub-packages

# 1.2.0

- Add support for automatic resolution of ESM or CJS import

# 1.1.0

- Add `scan` and `partition`
- Add pure annotations to output for better tree shaking

# 1.0.1

- Bugfix: `async/take` did not end its iterator after taking the requested number of values

# 1.0.0

1.0.0 to mark stability, it is fully compatible with `0.3.8`

- Add `collectRecord`, `all` and `any`
