# ![Origin Protocol](data/origin-header.png)

A UI leveraging `@origin/graphql`. View and manage listings and offers.

Demo at [https://ogn.dev/admin](https://ogn.dev/admin)

## Usage

    # Run from the monorepo root
    yarn
    cd dapps/admin
    yarn start

Watch the [video tutorial](https://drive.google.com/a/originprotocol.com/file/d/1JHXtYzl7qFyTNB62lNlOwZ_L6QCQnydB/view?usp=sharing) to see how to use this UI.

## Troubleshooting

### Testing moderation localy

Go to `packages/graphql/src/configs/localhost.js` and uncomment the discovery server.

### Resetting local data

From the top level of your local repo:

    cd packages/services
    yarn run clean

### The UI is stuck on "loading..."

Clear your browser's local storage for `@origin/admin`. This seems to correlate with resetting your blockchain or re-populating your contracts.
