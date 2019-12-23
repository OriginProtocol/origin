# ![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

## @origin/contractor

This package is an REPL (Read Eval Print Loop) interactive console that provides
globals for useful things, like an instanced Web3 instance, or instances of our
contracts.

Very useful for debugging and quick direct access to contract methods.

## Usage

    > contractor@0.1.0 start /home/mike/dev/origin/packages/contractor
    > node src/index.js "--help"

    Usage: index [options]

    Options:
      -n, --network <ID>  Ethereum network number to connect to (Default: 4)
      -h, --help          output usage information

Or as an npm script:

    npm run start --prefix packages/contractor -- -n 4

## Using the console

    $ npm run start --prefix packages/contractor -- -n 4

    > contractor@0.1.0 start /home/mike/dev/origin/packages/contractor
    > node src/index.js "-n" "4"

    Connected to network: 4
    Initialized contracts: ProxyFactory, IdentityEvents, Marketplace
    Available globals: version, web3
    > web3.eth.getChainId().then(id => { global.chainID = id; console.log(`We're conneted to network: ${chainID}`); })
    Promise {
      <pending>,
      domain:
       Domain {
         domain: null,
         _events:
          [Object: null prototype] {
            removeListener: [Function: updateExceptionCapture],
            newListener: [Function: updateExceptionCapture],
            error: [Function: debugDomainError] },
         _eventsCount: 3,
         _maxListeners: undefined,
         members: [],
         [Symbol(kWeak)]: WeakReference {} } }
    We're conneted to network: 4
    > // now let's get a listing
    undefined
    > Marketplace.methods.listings(3).call().then(l => console.log(l))
    Promise {
      <pending>,
      domain:
       Domain {
         domain: null,
         _events:
          [Object: null prototype] {
            removeListener: [Function: updateExceptionCapture],
            newListener: [Function: updateExceptionCapture],
            error: [Function: debugDomainError] },
         _eventsCount: 3,
         _maxListeners: undefined,
         members: [],
         [Symbol(kWeak)]: WeakReference {} } }
    Result {
      '0': '0xaDc10Da9039CbBDed8d90cf72626fa9f1A07A593',
      '1': '0',
      '2': '0xaDc10Da9039CbBDed8d90cf72626fa9f1A07A593',
      seller: '0xaDc10Da9039CbBDed8d90cf72626fa9f1A07A593',
      deposit: '0',
      depositManager: '0xaDc10Da9039CbBDed8d90cf72626fa9f1A07A593' }
    > 
