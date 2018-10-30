# Local Development

Ready to get started developing Origin.js and the Demo DApp? You will need two terminal windows: one for origin.js and one for the DApp.

Origin.js:

<pre style="margin-right: 50%; float:none; width: inherit; margin-bottom: 10px">
    mkdir -p origin
    cd origin
    git clone https://github.com/OriginProtocol/origin.git
    cd origin/origin-js
    git checkout develop
    npm run install:dev
    npm run start
</pre>

And in another window, let's get the Demo DApp going:

<pre style="margin-right: 50%; float:none; width: inherit; margin-bottom: 10px">
    cd .. (or /path/to/origin)
    git clone https://github.com/OriginProtocol/origin.git
    cd origin/origin-dapp
    git checkout develop
    npm run install:dev
    npm run start
</pre>

Your local repos have been setup to use the develop branches, since that's where all our new work starts from. You have also linked the Demo DApp to use your local copy of the Origin.js library, so that your changes to Origin.js are reflected immediately.

You will now need to have [MetaMask](https://metamask.io/) installed in your browser and connect it to "Localhost 8545". Then visit http://localhost:3000/ to see the DApp.

If you make changes to the contract code, or want to reset the contracts back to their starting states, you will want to stop (`ctrl-c`) your Origin.js development server. Then start it back up again with `npm run start`. After doing this, you must clear MetaMask's caches (or you will be getting old and invalid data). To do this:

- Change the MetaMask network to any testnet
- Change back to "Localhost 8545"
- Go to MetaMask "Custom RPC" in the Network menu, and press "Reset Account"
- Reload http://localhost:3000/ in your browser
