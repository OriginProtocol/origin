![Origin Protocol](data/origin-header.png)

A UI leveraging origin-graphql. View and manage listings and offers.

Demo at https://www.originadm.in

## Usage

    npx lerna bootstrap
    npm start

`npm start` also starts a local blockchain and IPFS server.

Watch the [video tutorial](https://drive.google.com/a/originprotocol.com/file/d/1JHXtYzl7qFyTNB62lNlOwZ_L6QCQnydB/view?usp=sharing) to see how to use this UI.

## Troubleshooting

### How do I reset my local blockchain?

From the top level of your local repo:

```
cd packages/services
num run clean
```

### The UI is stuck on "loading..."

Clear your browser's local storage for `origin-admin`. This seems to correlate with resetting your blockchain or re-populating your contracts.
