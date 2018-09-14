⚠️ NOTE: This doc is dated, now that we have changed our git branch strategy and are moving away from Heroku. See discussion happening around release. 

This file is the template for generating an issue for each release.

---

NOTE: This checklist is generated from [RELEASE.md](https://github.com/OriginProtocol/origin-js/blob/master/RELEASE.md) when beginning the release procedure.

## Prepare a release candidate
Release branches should be created well before a release is ready to be published. Sometime after a prior release has been merged and once all of a release's planned features have been merged to `master`, a new branch should be created from `master`:
- [ ] _origin-dapp_: Create a release branch (if applicable)
  - `git checkout -b release-0.8.0 master`
- [ ] _origin-js_: Create a release branch (if applicable)
  - `git checkout -b release-0.8.0 master`
- [ ] _origin-bridge_: Create a release branch (if applicable)
  - `git checkout -b release-0.8.0 master`

No additional features should be added to this release branch. Only bug fixes should be merged directly to the release branch, which itself should eventually be merged back to `master` in the [Publish](#publish) step.

## Confirm readiness
- [ ] _origin-js_ : In `package.json`, confirm version is `0.8.0`
- [ ] _origin-js_: Confirm js tests passing
  - `docker-compose -f docker-compose-test.yml up origin-js-test`
- [ ] _origin-dapp_: Confirm it runs against local (linked) origin-js
  - `docker-compose up`
  - `open http://localhost:3000/`
  - Note: Probably need to **Reset Account** on MetaMask.
- [ ] Build DApp in production mode locally
  - `npm run build`
  - This will generate build directory.
  - `cd build && python -m SimpleHTTPServer 8000`
- [ ] Confirm deployment accounts have eth for gas.
  - Both accounts [0] and [1] need gas, as test listings are created from [1].
  - Set mnemonic
    - `export RINKEBY_MNEMONIC="_____"`
    - `export ROPSTEN_MNEMONIC=$RINKEBY_MNEMONIC`
  - `npm run scripts/deploy_checklist.js`
  - [ ] Rinkeby ([Faucet](https://faucet.rinkeby.io/))
    - [ ] Social proof URL: `https://twitter.com/KeystonePaperCo/status/1012803664509952001`
    - [ ] account[0] [`0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61`](https://rinkeby.etherscan.io/address/0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61)
    - [ ] account[1] [`0x3003F9dCFDC17e63cfe7023130B804829b369882`](https://rinkeby.etherscan.io/address/0x3003F9dCFDC17e63cfe7023130B804829b369882)
  - [ ] Ropsten ([Faucet](https://faucet.metamask.io/))
    - [ ] account[0] [`0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61`](https://ropsten.etherscan.io/address/0xfF2BA846ab52EDBd724A5ef674AbF5A763849B61)
    - [ ] account[1] [`0x3003F9dCFDC17e63cfe7023130B804829b369882`](https://ropsten.etherscan.io/address/0x3003F9dCFDC17e63cfe7023130B804829b369882)

## Publish
### origin-js
- [ ] _origin-js_ : In `package.json`, confirm version is `0.8.0`
- [ ] _origin_js Update README.md example code to new version.
  - `<script src="https://code.originprotocol.com/origin-js/origin-v0.8.0.js"></script>`
- [ ] If contracts have changed:
  - Show diff with: `git diff stable..master contracts/contracts/`
  - `cd contracts`
  - [ ] Deploy new smart contracts to Ropsten. Be sure addresses are listed in ABI files.
    - `npx truffle migrate --reset --network ropsten | tee releases/0.8.0_ropsten.log`
  - [ ] Deploy new smart contracts to Rinkeby.  Be sure addresses are listed in ABI files.
    - `npx truffle migrate --reset --network rinkeby | tee releases/0.8.0_rinkeby.log`
  - [ ] Migrate data from old contracts to new. (Once we get around to writing migrations!)
  - [ ] _origin-js_: Build `origin.js` file (in `dist/origin.js`) using `npm run build` -- **Not redundant:** This will bake in the new contract addresses into `./node_modules/origin/dist/origin.js`
  (Note: I think we can actually do this after `npm publish`, as that does an inplicity `npm run build` as part of publishing... But then, we need to be able to test...)
    - `npm run install:dev`
- [ ] _origin-js_: Merge and push branches
  - `git checkout master`
  - `git merge --no-ff rerelease-0.8.0`
  - `git push`
  - `git checkout stable`
  - `git merge --no-ff rerelease-0.8.0`
  - `git push`
- [ ] _origin-js_: Delete release branch
  - `git branch -D rerelease-0.8.0`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-js/branches)
- [ ] _origin-js_: Create new [GitHub release](https://github.com/OriginProtocol/origin-js/releases) with origin.js code,
  - [ ] Version in form `v0.8.0` (This will add git tag on `stable`)
  - [ ] Include output of Truffle logs (containing addresses of smart contracts) in description
  - [ ] Include block number the contracts were deployed at
    - `https://rinkeby.etherscan.io/address/<contract address>`
    - ex. `https://rinkeby.etherscan.io/address/0x29d260c47411a0b9eeeb087925afa759914b0d2f`
- [ ] _origin-js_: [Publish to npm](https://docs.npmjs.com/cli/publish).
  - `npm publish`

### origin-dapp
- [ ] _origin-dapp_: Build against npm version. This will update `package-lock.json`
  - `npm unlink --no-save origin && npm install && npm run build`
- [ ] `git add package.json && git commit -m "0.8.0 release"`
- [ ] _origin-dapp_: Merge and push branches
  - `git checkout master`
  - `git merge --no-ff release-0.8.0`
  - `git push`
  - `git checkout stable`
  - `git merge --no-ff release-0.8.0`
  - `git push`
- [ ] _origin-js_: Delete release branch
  - `git branch -D release-0.8.0`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-dapp/branches)
- [ ] _origin-dapp_: Confirm that origin-dapp works when run alone again NPM.
- [ ] _origin-dapp_: Test deploy dapp to heroku
  - `git clone https://github.com/OriginProtocol/origin-dapp/tree/stable && cd origin-dapp`
  - `heroku create && git push heroku master`
- [ ] _origin-dapp_: Add git tag to `stable` to match origin-js.
  - `git tag -a v0.8.0 -m "New release"`
- Create IFPFS deploy of DApp
  - `scripts/deploy.sh` (See usage notes in file)

### origin-bridge
Prerequesites:
 - Install the [Heroku cli](https://devcenter.heroku.com/articles/heroku-cli) on your local host.

Publish steps:
- [ ] Merge and push branches.
  - `git checkout master`
  - `git merge --no-ff release-X.Y.Z`
  - `git push`
  - `git checkout stable`
  - `git merge --no-ff release-X.Y.Z`
  - `git push`
- [ ] Delete release branch.
  - `git branch -D release-X.Y.Z`
  - _Manually_ [delete on GitHub](https://github.com/OriginProtocol/origin-bridge/branches)
- [ ] Add git tag to `stable` to match origin-js.
  - `git checkout stable`
  - `git tag -a vX.Y.Z -m "New release"`
  - `git push`
- [ ] Push to Heroku.
  - Clone Heroku git repo.
    - `heroku git:clone -a bridge-originprotocol-com`
    - `cd bridge-originprotocol-com/`
  - Pull Origin's `stable` into Heroku's `master`.
    - `git remote add origin https://github.com/OriginProtocol/origin-bridge.git`
    - `git pull origin stable`
  - Push to heroku's git repo. This will also trigger Heroku to rebuild the packages, run DB migration(s) and deploy the new code.
    - `git push heroku master`
- [ ] Check the Heroku deployment succeeded.
  - Check the web process is up.
    - `heroku ps -a bridge-originprotocol-com`
  - Tail the logs for errors.
    - `heroku logs -a bridge-originprotocol-com --tail`
  - Verify the [home page](https://bridge.originprotocol.com) loads.

## Follow-up
- [ ] Confirm published `origin.js` file is accessible via `code.originprotocol.com` redirect
  - https://code.originprotocol.com/origin-js/origin-v0.8.0.js
- [ ] _origin-dapp_ `npm unlink --no-save origin`
- [ ] _origin-dapp_: Confirm that "one-line setup & run" command works on `stable` branch shown by default
- [ ] _origin-js_: Increment version number on `master` to for next release
  - `git checkout master`
  - `subl package.json`
- [ ] `git push`
- [ ] _docs_: Review docs for needed updates. Confirm example code on playground site (jsfiddle?) still work.
- [ ] Copy this to-do list into new issue for next sprint.
- [ ] Post notice of new release on Discord

## Troubleshooting

- `Error: insufficient funds for gas * price + value`:
  - Not enough funds in primary or secondary account. Usually hits when I forget to put funds in second account and it trys to deploy sample listings.
- Environment variables not being found despite adding them to the Heroku config:
  - Confirm that they are included in the [Webpack config](https://github.com/OriginProtocol/origin-dapp/blob/stable/webpack.config.js#L12-L20).
