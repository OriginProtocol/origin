# Marketplace integration tests

The Marketplace dapp tests work using [Puppeteer](https://pptr.dev/) - an
version of Chrome that can be optionally be run in headless mode on a server. We
issue browser commands such as 'visit this URL' or 'click this link' in order to
simulate user browser interactions and confirm the dapp is responding in the
expected manner.

Testing at the browser level ensures that all parts of the system work as
intended.

## Running tests

The following commands are available:

- `npm test` - runs tests in headless mode
- `npm run test:browser` - runs tests in a browser
- `npm run test:watch` - re-runs tests in a browser window when a file changes

If you would like screenshots to get captured during the tests, set the SCREENSHOTS environment variable before running the tests.
- `export SCREENSHOTS=true`

The screenshots will be saved under the test/screenshots directory.

## Writing tests

1. Start in watch mode with `npm run test:watch`
2. Add a new `describe.only` block to index.js with a description of the action
   you are testing. Use one of the other describe blocks as a template.
3. Save your test and watch it being executed in the browser.
4. Tweak your test until it executes successfully.
5. Remove `.only` from the new describe block and verify that all tests execute
   successfully.

### Tips for writing tests

- **Try not to rely on fixtures.** Developing tests is more efficient when using
  watch mode, where tests are re-run after a file is changed. Since the on-chain
  state is not reset between test runs, it's easier to just add new data instead
  of relying on data already existing. For example, when testing the purchase
  flow, we always start by adding a new listing and making new offers on that.
- **Use `describe.only` to limit scope.** This is useful when working on a
  specific test to prevent all other tests from running. Don't forget to remove
  the `.only` when finished writing the test.

## Helper functions

`_helpers.js` contains convenience functions to ease the process of writing
tests:

- `createAccount` - generates a new wallet, sends it 0.5 Eth and returns the
  wallet address. Useful for simulating new users.
- `changeAccount(address)` - switches the active wallet to the given address.
  Useful for switching between buyer and seller.
- `clickBySelector(page, selector)` - Finds the first element on the page
  matching the given selector and clicks it.
- `clickByText(page, text, path)` - Finds the first element on the page
  containing the given test and clicks it. If `path` is provided, only finds
  elements that are children of the given path.
- `waitForText(page, text, path)` - Waits for the given text to be visible on
  the page before continuing execution.
