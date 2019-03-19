![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Testing

This describes Origin's automated test setup. Linting, unit testing, and integration testing is run by TravisCI on each push or pull request.

## Linting

Linting is handled by `eslint`. The root of the repository contains a base eslint config in `.eslintrc.js` which can be imported and extended by the Origin packages. For an example of extending this base config to support React see `dapps/marketplace/.eslintrc.js`.

## Unit Testing

Each package implements its own unit tests that should be runnable by using `lerna run test --scope <package_name>` from root or `npm run test` from within the package directory.

## Integration Testing

Integration testing is provided by the `tests` package. It uses the Docker Compose setup to run Origin components and then executes tests against those services. The available services and their addresses are:

```
- bridge on http://bridge:5000 (also localhost)
- dapp on http://dapp:3000 (also localhost)
- discovery (event-listener)
- discovery (apollo server on http://localhost:4000)
- ipfs-proxy on http://ipfs-proxy:9999 (also localhost)
- messaging on http://messaging:9012 (also localhost)
- notifications on http://notifications:3456 (also localhost)
- ipfs at http://origin:5002 (gateway) and http://origin:8080 (api)
- ganache at http://origin:8545 (also localhost)
- postgresql at postgres://origin:origin@postgres/origin
- elasticsearch on http://elasticearch:9200 (also localhost)
```
