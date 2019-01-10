![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

![origin_npm_version](https://img.shields.io/npm/v/origin.svg?style=flat-square&colorA=111d28&colorB=1a82ff)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin/blob/master/origin-js/LICENSE)
[![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin/master.svg?style=flat-square&colorA=111d28)](https://travis-ci.org/OriginProtocol/origin)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# origin-js

origin-js is a library of javascript code and Ethereum smart contracts which allow anyone to create decentralized marketplaces, including for fractional usage. It is an open source project created by [Origin Protocol](https://www.originprotocol.com/).

⚠️ This is an alpha version which is not suitable for production environments.

## Documentation

[origin-js documentation](http://docs.originprotocol.com/)

## Demo

Our DApp is currently running on the Ethereum mainnet and showcases what can be achieved with origin-js.

- [Overview and step-by-step instructions](https://medium.com/originprotocol/draft-origin-launches-beta-on-mainnet-draft-e3b70161ae86)
- [Live Demo](http://dapp.originprotocol.com)
- [Github Repo](https://github.com/OriginProtocol/origin/tree/master/origin-dapp#origin-demo-dapp)

## Using origin-js in your project

### As a node package

```
npm install origin --save
```
or
```
yarn add origin
```

### Plain javascript

A browser-compatible plain javascript file `origin.js` is available in the [Releases section](https://github.com/OriginProtocol/origin/releases). A hosted version can be directly included in your html as:
```html
<script src="https://code.originprotocol.com/origin-js/origin-v0.7.1.js"></script>
```

`npm build` will generate this file and save it to `dist/origin.js`.

## Tests

### Command Line (All Tests)

We use the [mocha test framework](https://mochajs.org/). The full test suite can be run with:

```
npm run test
```

 Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

To run tests and automatically re-run when files change:
```
npm run test:jsw
```

To run a subset of tests, you can use mocha's `-g` option followed by a pattern. For example to run the unit tests for the marketplace resource, do:
```
npm run test:js -g "Marketplace Resource"
```

## Troubleshooting

### Python 3

If you have Python 3 installed, you may see this error when installing dependencies:

```
gyp ERR! stack Error: Python executable "/Users/aiham/.pyenv/shims/python" is v3.6.4, which is not supported by gyp.
```

Resolve this by configuring npm to use Python 2 (where python2.7 is a binary accessible from your $PATH):

```
npm config set python python2.7
```

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
