This file is the template for generating an issue for each release. 

---

NOTE: This checklist is generated from [RELEASE.md](https://github.com/OriginProtocol/origin-js/blob/develop/RELEASE.md) when beginning the release procedure.

## Prepare a release candidate
Release branches should be created well before a release is ready to be published. Sometime after a prior release has been merged and once all of a release's planned features have been merged to `develop`, a new branch should be created from `develop`:
- [ ] _origin-dapp_: Create a release branch (if applicable)
  - `git checkout -b release-0.3.0 develop`
- [ ] _origin-js_: Create a release branch (if applicable)
  - `git checkout -b release-0.7.0 develop`
- [ ] _origin-bridge_: Create a release branch (if applicable)
  - `git checkout -b release-0.2.0 develop`

No additional features should be added to this release branch. Only bug fixes should be merged directly to the release branch, which itself should eventually be merged back to `develop` in the [Publish](#publish) step.

## Confirm readiness
- [ ] _origin-js_: Confirm js tests passing
  - `git checkout rerelease-0.7.0`
  - `git pull`
  - `npm run install:dev`
  - `npm test` (This will also test smart contracts)
  - `npm start`
- [ ] _origin-dapp_: Confirm all tests passing
- [ ] _origin-dapp_: Confirm it runs against remote (unlinked) origin-js
  - `git checkout release-0.3.0`

  - `git pull`
  - `npm install`
  - `npm start`
- [ ] _origin-dapp_: Confirm it runs against local (linked) origin-js
  - `git checkout release-0.3.0`
  - `git pull`
  - `npm run install:dev`
  - `npm start`
  - Probably need to **Reset Account** on MetaMask. 
- [ ] Confirm deployment accounts have eth for gas. 
  - Both accounts need gas, as test listings are created from second. 
  - `npm run deploy_checklist`
  - [ ] Rinkeby ([Faucet](https://faucet.rinkeby.io/)) 
    - [ ] Social proof URL: `https://twitter.com/KeystonePaperCo/status/1012803664509952001`
    - [ ] account[0] [`0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61`](https://rinkeby.etherscan.io/address/0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61)
    - [ ] account[1] [`0x3003F9dCFDC17e63cfe7023130B804829b369882`](https://rinkeby.etherscan.io/address/0x3003F9dCFDC17e63cfe7023130B804829b369882)
  - [ ] Ropsten ([Faucet](https://faucet.metamask.io/))
    - [ ] account[0] [`0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61`](https://ropsten.etherscan.io/address/0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61)
    - [ ] account[1] [`0x3003F9dCFDC17e63cfe7023130B804829b369882`](https://ropsten.etherscan.io/address/0x3003F9dCFDC17e63cfe7023130B804829b369882)

## Publish
### origin-js
- [ ] _origin-js_ : In `package.json`, confirm version is `0.7.0`
- [ ] If contracts have changed:
  - Show diff with: `git diff master..develop contracts/contracts/`  
  - `cd contracts`
  - [ ] Deploy new smart contracts to Ropsten. Be sure addresses are listed in ABI files. 
    - `export ROPSTEN_MNEMONIC="<mnemonic>"`
    - `npx truffle migrate --reset --network ropsten | tee releases/0.7.0_ropsten.log`
  - [ ] Deploy new smart contracts to Rinkeby.  Be sure addresses are listed in ABI files. 
    - `export RINKEBY_MNEMONIC=$ROPSTEN_MNEMONIC`
    - `npx truffle migrate --reset --network rinkeby | tee releases/0.7.0_rinkeby.log`
  - [ ] Migrate data from old contracts to new. (Once we get around to writing migrations!)
  - [ ] _origin-js_: Build origin.js (in `dist/origin.js`) -- **Not redundant:** This will bake in the new contract addresses into the contract's `.json` files. 
    - `npm run install:dev`
- [ ] _origin-js_: Merge and push branches
  - `git checkout develop`
  - `git merge --no-ff rerelease-0.7.0`
  - `git push`
  - `git checkout master`
  - `git merge --no-ff rerelease-0.7.0`
  - `git push`
- [ ] _origin-js_: Delete release branch
  - `git branch -D rerelease-0.7.0`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-js/branches)
- [ ] _origin-js_: Create new [GitHub release](https://github.com/OriginProtocol/origin-js/releases) with origin.js code,
  - [ ] Version in form `v0.7.0` (This will add git tag on `master`)<<<<<<< HEAD
  - [ ] Include output of Truffle logs (containing addresses of smart contracts) in description
  - [ ] Include block number the contracts were deployed at
    - `https://rinkeby.etherscan.io/address/<contract address>`
    - ex. `https://rinkeby.etherscan.io/address/0x29d260c47411a0b9eeeb087925afa759914b0d2f`
- [ ] _origin-js_: [Publish to npm](https://docs.npmjs.com/cli/publish). 
  - `npm publish`

### origin-dapp
- [ ] _origin-dapp_: Build against npm version. This will update `package-lock.json`
  - `npm unlink --no-save origin && npm install && npm run build`
- [ ] `git add package.json && git commit -m "0.3.0 release"`
- [ ] _origin-dapp_: Merge and push branches
  - `git checkout develop`
  - `git merge --no-ff release-0.3.0`
  - `git push`
  - `git checkout master`
  - `git merge --no-ff release-0.3.0`
  - `git push`
- [ ] _origin-js_: Delete release branch
  - `git branch -D release-0.3.0`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-dapp/branches)
- [ ] _origin-dapp_: Confirm that origin-dapp works when run alone again NPM. 
- [ ] _origin-dapp_: Test deploy dapp to heroku
  - `git clone https://github.com/OriginProtocol/origin-dapp && cd origin-dapp`
  - `heroku create && git push heroku master`
- [ ] _origin-dapp_: Add git tag to `master` to match origin-js.
  - `git tag -a v0.3.0 -m "New release"`

### origin-bridge
- [ ] _origin-dapp_: Merge and push branches
  - `git checkout develop`
  - `git merge --no-ff release-0.2.0`
  - `git push`
  - `git checkout master`
  - `git merge --no-ff release-0.2.0`
  - `git push`
- [ ] _origin-js_: Delete release branch
  - `git branch -D release-0.2.0`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-bridge/branches)
- [ ] _origin-bridge_: Add git tag to `master` to match origin-js.
  - `git tag -a v0.2.0 -m "New release"`

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

## Troubleshooting

- `Error: insufficient funds for gas * price + value`
  - Not enough funds in primary or secondary account. Usually hits when I forget to put funds in second account and it trys to deploy sample listings. 
