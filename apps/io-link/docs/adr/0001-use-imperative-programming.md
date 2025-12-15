# 1. Use-imperative-programming

Date: 2023-04-07

## Status

2023-04-07 proposed

## Context

This service is composed mostly by infrastructure code and uses `express.js` as application framework that, by default, it's not meant to be used in conjuction with functional programming patterns.

Requiring the use of functional programming libraries such as `fp-ts` means we would be forced to write adapters for each (external) infrastructural dependency, without having an important benefit unlike projects with a large domain layer.

In addition to increasing the code surface to be kept up to date, we would also risk making it less understandable.

## Decision

We decided to use idiomatic TypeScript, with the structures provided by the JavaScript standard libraries and the common pattern (such as "throwing an exception on error") adopted by our external dependencies, that are mostly imperative.

In addition of the standard library, we decided to use `zod` (instead of `io-ts`) to validate types at runtime because it better suits the imperative programming paradigm.
