# Linking Server

Communicates with [Origin mobile wallet app](https://github.com/OriginProtocol/origin/tree/master/mobile). It receieves messages from the [Linker Client](https://github.com/OriginProtocol/origin/tree/master/packages/linker-client) concerning web3 transactions to be completed in the wallet. It can also push messagse to the phone where the app is installed. 

Messages sent via Firebase.

- `sendNotify`, pushes a notfication to the app. 

Wallet notification messages include:

- `Confirm your listing for ${meta.listing.title}`
- `Confirm your offer for ${meta.listing.title}`
- `Confirm the rejection of an offer for ${meta.listing.title}`
- `Confirm the withdrawal of an offer for ${meta.listing.title}`
- `Confirm the acceptance of an offer for ${meta.listing.title}`
- `Confirm your reporting of a problem ${meta.listing.title}`
- `Confirm the release of funds for ${meta.listing.title}`
- `Confirm your review from selling ${meta.listing.title}`
- `${meta.method} pending for ${meta.listing.title}`
- `Confirm the publishing of your identity`
- `Pending call to ${meta.contract}.${meta.method}`
- `There is a pending call for your approval`
