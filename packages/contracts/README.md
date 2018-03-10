# OriginProtocol Smart Contracts Documentation

![Codeship Status](https://app.codeship.com/projects/279083/status?branch=master)

## Introduction

This is very much a work in progress. Please refer to our [Discord](http://originprotocol.com/discord)
before trying to do any work based on the code in this repository :)

Despite being super early, we're going to do our best to make sure tests always pass!
If the tests don't pass, either something is wrong with your setup, or you found a
genuine bug. Please join our #engineering channel on Discord and report it!

## Testing

### Test on local blockchain

In terminal
```
truffle develop
```
and then at prompt type:
```
test
```

### Rinkeby, Ropsten, Main, and other blockchains
```
truffle test
```

## Troubleshooting

If you get the following error:

```
Error: Attempting to run transaction which calls a contract function, but recipient address 0x8cdaf0cd259887258bc23a92c0a6da92698644c0 is not a contract address
```

Resolve this by deleting the previously built contracts:

```sh
rm build/contracts/*.json
```
