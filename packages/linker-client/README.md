# Linker Client

WalletLinkerClient is a client for [Origin linking server](https://github.com/OriginProtocol/origin/tree/master/infra/linking). It exposes a web3
provider that routes web3 transactions to the linking server, which then
forwards the transaction to the mobile wallet app for signing and sending
to the blockchain.
