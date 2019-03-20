# Origin Token

The [Origin Token](https://github.com/OriginProtocol/origin/tree/master/origin-contracts/contracts/token) is based on the [OpenZeppelin 1.10.0 ERC-20 contracts](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/v1.10.0/contracts/token/ERC20) with some custom functionality.

It inherits from the following OpenZeppelin contracts:

* `BurnableToken`: allows tokens to be burned
* `MintableToken`: allows tokens to be minted by the contract owner
* `PausableToken` (through the Origin contract `WhitelistedPausableToken`): allows contract owner to pause all `transfer`s and `approve`s for the token
* `DetailedERC20`: provides metadata used by Etherscan, Metamask, and other tools

# Custom contracts

## OriginToken

This is the main token contract that our Truffle migrations deploy. It has the
following custom code:

* Restricts the `burn` functions from `BurnableToken` so that they're only callable by the contract owner. Because there is no specific use for `burn` yet, it's safer to restrict its use.
* `approveAndCallWithSender`
  * Inspired by ERC-827's `approveAndCall` function, which provides the ability to approve a transfer and make a contract call in one Ethereum transaction.
  * Automatically inserts `msg.sender` as the first parameter for the called contract function.
  * The address to be `approve`d must be in the spender whitelist. The intention is that only specific contracts (e.g. the Origin marketplace contracts) may be the target for this function. This restriction prevents the token contract from becoming an open, hard to secure proxy.
  * The contract function called by `approveAndCallWithSender` *must* check that `msg.sender` is the token contract.
* `addCallSpenderWhitelist` and `removeCallSpenderWhitelist` maintain the spender whitelist for `approveAndCallWithSender`.

## WhitelistedPausableToken

This contract inherits from OpenZeppelin's `PausableToken` contract and adds a transactor whitelist. While the whitelist is active, token transfers must involve either a whitelisted sender or recipient. The whitelist allows us to gradually roll out the token.

Here are the possible combinations of accounts and whether they are allowed to transfer tokens:

| Sender          | Recipient       | Can transfer tokens? |
|---------------- | --------------- | -------------------- |
| Whitelisted     | Not whitelisted | yes                  |
| Not whitelisted | Whitelisted     | yes                  |
| Whitelisted     | Whitelisted     | yes                  |
| Not whitelisted | Not whitelisted | no                   |

### Whitelist expiration

The OriginToken contract defaults to an inactive whitelist. In this state, all token transfers are allowed.

The whitelist becomes active when the contract owner sets the expiration to a future UNIX timestamp. Our Truffle migration scripts handle the setup of the whitelist.

Whitelist expiration may be postponed by calling `setWhitelistExpiration` with a timestamp that's higher than the current expiration. This is only allowed if the whitelist is still active. If the whitelist has already expired, it's gone for good.

## TokenMigration

This contract is a key part of the migration strategy we're using for token contract upgrades. Instead of upgrading token contracts in-place through proxies or other mechanisms, future token upgrades will migrate balances from the old contract to the new one.

`TokenMigration` provides a simple set of functions that migrate the balances for individual accounts or batches of accounts by minting tokens with the new contract.

The intended use for `TokenMigration` is:
1. Pause the old `OriginToken` contract
2. Pause the new `OriginToken` contract
3. Transfer ownership of the new `OriginToken` contract to the `TokenMigration` contract. This allows `TokenMigration` to transfer existing balances to the new contract by minting tokens.
4. Run a Node command-line tool (in prototype state) that reads all ERC20 `Transfer` events and feeds the senders and recipients into the `migrateAccounts` function.
5. After all migrations finish, the Node migration tool would call the contract's `finish` function to ensure that the total supply of tokens is the same for the old and new contracts. If all checks pass, `finish` transfers ownership of the new token contract to its rightful owner and prevents itself from being used for any further migrations.

# Security model

All ERC20 functions have the usual safety checks, provided by the OpenZeppelin ERC20 contracts.

Non-ERC20 functions that mutate contract state must be called by the token contract owner. This includes:

* `mint` tokens
* `burn` tokens
* Modifying the spender whitelist for `approveAndCallWithSpender`
* Modifying the transactor whitelist for `transfer` and `transferFrom`
* Setting the expiration for the transactor whitelist
