# Token Command-Line Interface (CLI)

The token CLI provides an interface for safely performing operations on a deployed OriginToken contract.

The basic syntax is:

```
node token_cli.js --action=ACTION
```

The following sections describe the various features of the CLI.

---

## Token Actions

### Show status of the token contract

```
$ node token_cli.js --action=status
Network=999 Url=http://localhost:8545 Mnemonic=xxx
Token status for network 999:
contract address:        0x345ca3e014aaf5dca488057592ee47305d9b3e10
name:                    OriginToken
decimals:                18
symbol:                  OGN
total supply (natural):  1000000000000000000000000000
total supply (tokens):   1000000000
contract owner:          0x627306090abaB3A6e1400e9345bC60c78a8BEf57
transfers paused:        no
transactor whitelist:    active until Thu Feb 28 2019 00:00:00 GMT-0800 (PST)
```

### Transfer 100 OGN to an address

```
$ node token_cli.js --action=credit --address=ADDRESS
```

Example:
```
$ node token_cli.js --action=credit --address=0xf17f52151ebef6c7334fad080c5704d77216b732
Credited 100 OGN tokens to wallet. New balance (natural unit) = 200000000000000000000
```

### Pause all token transfers and approvals

Example:
```
$ node token_cli.js --action=pause
Mon Sep 17 2018 13:36:31 GMT-0400 (EDT) estimated gas: 28450
Mon Sep 17 2018 13:36:31 GMT-0400 (EDT) sending transaction
Mon Sep 17 2018 13:36:31 GMT-0400 (EDT) transaction hash: 0xbd0afcba2053353810e5b9f671ff3c3b7fb558fa925c43ec31f96756f9584ae7
Token transfers have been paused.
```

### Unpause all token transfers and approvals

Example:
```
$ node token_cli.js --action=unpause
Mon Sep 17 2018 13:37:13 GMT-0400 (EDT) estimated gas: 28164
Mon Sep 17 2018 13:37:13 GMT-0400 (EDT) sending transaction
Mon Sep 17 2018 13:37:13 GMT-0400 (EDT) transaction hash: 0x0418a49a419234682be186709f18449f99b7db0901688b42428b0480f6bafe28
Token transfers have been unpaused.
```

### Set owner of token contract

```
$ node token_cli.js --action=setTokenOwner --address=ADDRESS
```

Example:
```
$ node token_cli.js --action=setTokenOwner --address=0xf17f52151ebef6c7334fad080c5704d77216b732
Mon Sep 17 2018 13:42:24 GMT-0400 (EDT) estimated gas: 31056
Mon Sep 17 2018 13:42:24 GMT-0400 (EDT) sending transaction
Mon Sep 17 2018 13:42:24 GMT-0400 (EDT) transaction hash: 0x7c3fa9b45f731626254f76388cf411602225e754f230f5a0daae0cdd0bc7d2b3
Contract owner set to 0xf17f52151ebef6c7334fad080c5704d77216b732
```

As a safety measure, the owner must be set to one of the addresses in the [token owner whitelist](https://github.com/OriginProtocol/origin/blob/master/origin-faucet/lib/owner_whitelist.js).

You can override the whitelist if you *really* need to by using the `--OVERRIDE_OWNER_WHITELIST_DO_NOT_USE` parameter.

---

## Marketplace Actions

Due to lack of implementation time, the token CLI also has limited marketplace
contract features.

### Show status

Example:
```
$ node token_cli.js --action=marketplaceStatus
name:          V00_Marketplace
address:       0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF
owner:         0x627306090abaB3A6e1400e9345bC60c78a8BEf57
# of listings: 5
token address: 0xdB9693be211dC94E148151222d55Fa24efc4E4A6
```

### Set owner for marketplace contract

```
$ node token_cli.js --action=setMarketplaceOwner --contract=CONTRACT_NAME --address=ADDRESS
```

Example:
```
$ node token_cli.js --action=setMarketplaceOwner --contract=V00_Marketplace --address=0xf17f52151ebef6c7334fad080c5704d77216b732
Tue Sep 18 2018 21:41:35 GMT-0400 (EDT) estimated gas: 31059
Tue Sep 18 2018 21:41:35 GMT-0400 (EDT) sending transaction
Tue Sep 18 2018 21:41:35 GMT-0400 (EDT) transaction hash: 0xe0e75409a9f9da82c87ae4ecaefc3ec68c6c08e6f15e0d8927aad7a370f0a189
Tue Sep 18 2018 21:41:36 GMT-0400 (EDT) transaction successful
V00_Marketplace owner set to 0xf17f52151ebef6c7334fad080c5704d77216b732
```

### Set token address

The marketplace contract stores the address of the Origin token contract, so
that it can transfer commissions from the seller as part of creating a listing.
This action lets you set that stored address:

```
$ node token_cli.js --action=setMarketplaceTokenAddress --contract=CONTRACT_NAME --address=ADDRESS
```

Example:
```
$ node token_cli.js --action=setMarketplaceTokenAddress --contract=V00_Marketplace --address=0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef
```

---

## Multi-sig wallets

When the owner of the token contract is a multi-sig wallet contract, you
can add the `--multisig=MULTI_SIG_ADDRESS` parameter to submit contract
transactions through the multi-sig wallet. For example:

```
node token_cli.js --action=pause --multisig=0x4e72770760c011647d4873f60a3cf6cdea896cd8
Network=999 Url=http://localhost:8545 Mnemonic=candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
Mon Sep 17 2018 14:31:02 GMT-0400 (EDT) transaction data: 0x8456cb59
Mon Sep 17 2018 14:31:02 GMT-0400 (EDT) using multi-sig wallet 0x4e72770760c011647d4873f60a3cf6cdea896cd8 for txn to 0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF
Mon Sep 17 2018 14:31:02 GMT-0400 (EDT) estimated gas: 126850

Mon Sep 17 2018 14:31:02 GMT-0400 (EDT) transaction hash: 0xf275cf51461a68b92ea7a8682cf013598a5e6d49f05401db58ff35b0be550f07
Mon Sep 17 2018 14:31:03 GMT-0400 (EDT) got transaction receipt [...]
Mon Sep 17 2018 14:31:03 GMT-0400 (EDT) multi-sig transaction submitted for further signatures
```

At this point, the other owners of the multi-sig wallet need to sign the
transaction (e.g. through the [Gnosis DApp](https://wallet.gnosis.pm)) before the token is paused.

---

## Specifying network ID

Use the `--network_id=NETWORK_ID` parameter to specify the network ID.
By default, `network_id` is `999`, the ID of the local blockchain
started by `npm run start` in Origin.js. For example, if you wanted to
check the status of the token contract on Rinkeby, you'd run:

```
node token_cli.js --action=status --network_id=4
```

Valid network IDs are:

* 1 - mainnet
* 3 - Ropsten
* 4 - Rinkeby
* 222 - Origin development network
* 999 - local blockchain (default)

## Private keys and mnemonics

If you're using the local blockchain started by Origin.js, you don't need
to specify a mnemonic, because the CLI assumes you're using that if
you're using a local blockchain. Otherwise, you can set one of the
following environment variables:

| Network       | Private Key         | Mnemonic (seed words)  |
| ------------- | ------------------- | ---------------------- |
| development   | LOCAL_PRIVATE_KEY   | LOCAL_MNEMONIC         |
| ropsten       | ROPSTEN_PRIVATE_KEY | ROPSTEN_MNEMONIC       |
| rinkeby       | RINKEBY_PRIVATE_KEY | RINKEBY_MNEMONIC       |
| origin        | ORIGIN_PRIVATE_KEY  | ORIGIN_MNEMONIC        |
| mainnet       | MAINNET_PRIVATE_KEY | MAINNET_MNEMONIC       |

For example, to run against Rinkeby, we could run the following:

```
$ export RINKEBY_MNEMONIC="eat steak ..."
$ node token_cli.js action=credit --address=X --network_id=4
```

Notes:

* When a mnemonic is specified, the CLI uses the first account.
* When both a private key and mnemonic are specified for a network, the CLI uses the private key.
