# Contributing to Origin

Thanks for helping out! 👍

Before you summit a PR, you'll want to make sure that:

1. Any changes are tested.
2. All tests pass. Run `npm run test` from the root of the repository to run all packages tests or run `lerna run test --scope <package_name>` to run the tests for a single package.
3. The formatting is correct. Run `npm run lint` from the root of the repository.

If this is a new feature, make sure you've discussed it with [our #engineering channel on Discord](https://www.originprotocol.com/discord).


### Coding style: Javascript 

We use [NPM style](https://docs.npmjs.com/misc/coding-style), as automated by the [prettier](https://prettier.io) tool. 2 space indents, no semi-semicolons.

### Coding style: Solidity

We use two space indents. Just copy the surrounding style and use your good judgement.
