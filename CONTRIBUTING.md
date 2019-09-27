# Contributing to Origin

Thanks for helping out! 👍

Before you submit a PR, you'll want to make sure that:

1. Any changes are tested.
2. All tests pass. Run `yarn test` from the root of the repository to run all
   packages tests or run `lerna run test --scope <package_name>` to run the
   tests for a single package. For example
3. The formatting is correct. Run `yarn run prettier` from the root of the repository or `yarn run prettier --scope <package_name>` to run the formatting on a sinle package. For example `yarn run prettier --scope @origin/marketplace` will format the code in the directory dapps/marketplace.
4. The linter passes. Run `yarn lint` from the root of the repository.

If this is a new feature, make sure you've discussed it with
[our #engineering channel on Discord](https://www.originprotocol.com/discord).

## Coding style

### Javascript

We use [NPM style](https://docs.npmjs.com/misc/coding-style), as automated by
the [prettier](https://prettier.io) tool. 2 space indents, no semi-semicolons.

### Solidity

We use two space indents. Just copy the surrounding style and use your good
judgement.

## Coding guidelines

### ETH addresses

Both checksummed and lowercased ETH address are technically valid. In our
codebase, we chose the convention to:

- Display ETH addresses in their _checksummed_ format to the user.
- Store ETH addresses in their _lowercased_ format. That includes local storage
  and back-end storage such as Database, ElasticSearch, etc...
- Use _lowercased_ format when doing addresses comparisons.
