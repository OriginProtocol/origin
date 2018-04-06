![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Platform

Origin Protocol is a library of javascript code and Ethereum smart contracts which allow anyone to create decentralized marketplaces, including for fractional usage. 

Please refer to our [product brief](https://www.originprotocol.com/product-brief) and [technical whitepaper](https://www.originprotocol.com/whitepaper) for more detail.

 - [README for Javascript code](https://github.com/OriginProtocol/platform/tree/master/packages/origin.js)
 - [README for Ethereum contracts](https://github.com/OriginProtocol/platform/tree/master/packages/contracts)

## Follow our progress and get involved

This repo is under active development. We welcome your participation!

1. [Join our #engineering channel on Discord](http://www.originprotocol.com/discord).

2. Listen in on our weekly engineering call on Google Hangouts. It happens every week and everyone is welcome to listen in and participate. [Join us on Google Hangouts](https://meet.google.com/pws-cgyd-tqp) on Wednesdays at 9pm GMT ([Add to Calendar](https://calendar.google.com/event?action=TEMPLATE&tmeid=MHAyNHI3N2hzMjk5b3V2bjhoM2Q1ZWVzY2pfMjAxODA0MTFUMjAwMDAwWiBqb3NoQG9yaWdpbnByb3RvY29sLmNvbQ&tmsrc=josh%40originprotocol.com&scp=ALL)):

> | Pacific | Mountain | Central | Eastern | GMT |
> |---------|----------|---------|---------|-----|
> | Wed 1pm | Wed 2pm | Wed 3pm | Wed 4pm | Wed 9pm |
  
3. Catch up on our meeting notes & weekly sprint planning docs (feel free to add comments):
- [Engineering meeting notes](https://docs.google.com/document/d/1aRcAk_rEjRgd1BppzxZJK9RXfDkbuwKKH8nPQk7FfaU/)
- [Weekly sprint doc](https://docs.google.com/document/d/1qJ3sem38ED8oRI72JkeilcvIs82oDq5IT3fHKBrhZIM)

# What we're building

The main components of this repo are:

 - [Origin.js](/packages/origin.js/)
 - [Ethereum smart contracts](/packages/contracts/)
 - Origin DApp that's built on top of origin.js (basically our current demo-dapp reworked to use origin.js)

This library is an abstraction layer for developers who want to build DApps on Origin Protocol.

The library will make it easy for sellers to do things like:

 - Create listings
 - Update listings
 - Delete listings
 - Validate listings
 
And buyers to:
 
 - Browse listing
 - Create bookings
 - Update bookings
 - Cancel bookings
