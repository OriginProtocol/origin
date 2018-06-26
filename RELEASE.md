NOTE: We will update this checklist from [RELEASE.md](https://github.com/OriginProtocol/origin-js/blob/develop/RELEASE.md) when beginning the release procedure. 

## Confirm readiness
- [ ] _origin-js_: Confirm js tests passing
  - `git checkout develop`
  - `git pull`
  - `npm run install:dev`
  - `npm test` (This will also test smart contracts)
  - `npm start`
- [ ] _origin-dapp_: Confirm all tests passing
- [ ] _origin-dapp_: Confirm it runs against remote (unlinked) origin-js
  - `git checkout develop`
  - `git pull`
  - `npm install`
  - `npm start`
- [ ] _origin-dapp_: Confirm it runs against local (linked) origin-js
  - `git checkout develop`
  - `git pull`
  - `npm run install:dev`
  - `npm start`
  - Probably need to **Reset Account** on MetaMask. 
- [ ] Confirm deployment accounts have eth for gas
  - `npm run deploy_checklist`
  - [ ] Rinkeby ([Faucet](https://faucet.rinkeby.io/)) 
    - Public post for [0]: `https://plus.google.com/u/0/114203467826302852415/posts/F7sJZMGCbgg`
    - [ ] account[0] `0x1a5c29c94d03c4c8f7414564cbd57295d61e898f`
    - [ ] account[1] [`0x564aae0251d49d1f8d4d8d9e5da08f8cceff9ef2`](https://rinkeby.etherscan.io/address/0x564aae0251d49d1f8d4d8d9e5da08f8cceff9ef2)
  - [ ] Ropsten ([Faucet](https://faucet.metamask.io/))
    - [ ] account[0] `0x1a5c29c94d03c4c8f7414564cbd57295d61e898f`
    - [ ] account[1] `0x564aae0251d49d1f8d4d8d9e5da08f8cceff9ef2`

## Publish
### origin-js
- [ ] _origin-js_ : In `package.json`, confirm version is `0.7.0`
- [ ] If contracts have changed:
  - Show diff with: `git diff master..develop contracts/contracts/`  
  - `cd contracts`
  - [ ] Deploy new smart contracts to Ropsten. Be sure addresses are listed in ABI files. 
    - `export ROPSTEN_MNEMONIC="<mnemonic>"`
    - `npx truffle migrate --network ropsten | tee releases/0.7.0_ropsten.log`
  - [ ] Deploy new smart contracts to Rinkeby.  Be sure addresses are listed in ABI files. 
    - `export RINKEBY_MNEMONIC=$ROPSTEN_MNEMONIC`
    - `npx truffle migrate --network rinkeby | tee releases/0.7.0_rinkeby.log`
  - [ ] Migrate data from old contracts to new. (Once we get around to writing migrations!)
  - [ ] _origin-js_: Build origin.js (in `dist/origin.js`) -- **Not redundant:** This will bake in the new contract addresses into the contract's `.json` files. 
    - `npm run install:dev`
- [ ] _origin-js_: Merge `develop` into `master` and push
- [ ] _origin-js_: Create new [GitHub release](https://github.com/OriginProtocol/origin-js/releases) with origin.js code,
  - [ ] Version in form `v0.7.0` (This will add git tag on `master`)
  - [ ] Include addresses of smart contracts in description
- [ ] _origin-js_: [Publish to npm](https://docs.npmjs.com/cli/publish). 
  - `npm publish`
### origin-dapp
- [ ] _origin-dapp_: Update package version number in `package.json`
  -   ` "origin": "origin": "0.6.1"` --> `"origin": "0.7.0"`
  - `sed -i -e 's/0.6.1/0.7.0/g' package.json` 👈 is that command correct? (micah)
- [ ] _origin-dapp_: Build against npm version. This will update `package-lock.json`
  - `npm unlink --no-save origin && npm install && npm run build`
- [ ] `git add package.json && git commit -m "0.7.0 release"`
- [ ] _origin-dapp_: Merge `develop` into `master` and push
- [ ] _origin-dapp_: Confirm that origin-dapp works when run alone again NPM. 
- [ ] _origin-dapp_: Test deploy dapp to heroku
  - `git clone https://github.com/OriginProtocol/origin-dapp && cd origin-dapp`
  - `heroku create && git push heroku master`
- [ ] _origin-dapp_: Add git tag to `master` to match origin-js.
  - `git tag -a v0.7.0 -m "New release"`

### origin-bridge
- [ ] Copy contract ABIs from `origin-js` (located in `contracts/build/contracts`) to `origin-bridge` (located in `contracts`)
☝️ must happen *after* new contracts have been deployed to test nets!

- [ ] _origin-bridge_: merge `develop` to `master`
- [ ] _origin-bridge_: Add git tag to `master` to match origin-js.
  - `git tag -a v0.7.0 -m "New release"`

## Follow-up
- [ ] Confirm published `origin.js` file is accessible via `code.originprotocol.com` redirect
  - https://code.originprotocol.com/origin-js/origin-v0.7.0.js
- [ ] _origin-dapp_ `npm unlink --no-save origin`
- [ ] _origin-dapp_: Confirm that "one-line setup & run" command works on `master` branch shown by default
- [ ] _origin-js_: Increment version number to  on `develop` to for next release
  - `git checkout develop`
  - `subl package.json`
- [ ] `git push`
- [ ] _docs_: Review docs for needed updates. Confirm example code on playground site (jsfiddle?) still work.
- [ ] Copy this to-do list into new issue for next sprint.
- [ ] Post notice of new release on Discord
