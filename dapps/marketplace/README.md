# ![Origin Protocol](data/origin-header.png)

A UI leveraging `@origin/graphql`. View and manage listings and offers.

Test builds available [here](https://originprotocol.github.io/test-builds/).

## Usage

Refer to
[DEVELOPMENT.md](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md)

## Tests

Tests are run in a headless Chrome instance via puppeteer

    npm test

To observe the tests running in the browser:

    npm run test:browser

For more information please see the README in the `test` sub-directory.

##Troubleshoot
- To be able to access location features in developer environment Chrome requires the page to run using https protocol. 
  To circumvent that add an exception in Chrome flags. In url bar type: 
  `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
  and put the dapp exception in: `http://localhost:3000, http://{YOUR_IP}:3000`