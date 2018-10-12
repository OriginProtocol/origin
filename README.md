# Feature & Hide Lists
This branch is just for recording listings to feature or hide from public demo.

- `featurelist_X.txt` contains comma-seperated list of listing id's to be featured. 
- `hidelist_X.txt` contains comma-seperated list of listing id's to be hidden. 


`X` represents the network number it is for. E.g. Mainnet is 1, Rinkeby network is 4 and Ropsten network is 3.

E.g.
```
999-000-4,999-000-3
```

See: https://github.com/OriginProtocol/origin-dapp/pull/645

# Instructions for updating the Feature & Hide lists
 - Checkout the origin-dapp repo:

```git clone https://github.com/OriginProtocol/origin-dapp.git```

 - Checkout the hidefeature_list branch

`git checkout hidefeature_list`

 - Create a local branch for your changes

`git checkout -b <your_name>/<branch_name> origin/hidefeature_list`

For example:

`git checkout -b franck/list_updates origin/hidefeature_list`

 - Edit the desired file(s)

 - Commit and push the changes to github.com

```
git commit -am "<commit_message>"
git push origin <branch_name>
```

For example:
```
git commit -am "Added partners listings to feature list"
git push origin franck/list_update
```

 - Go to the [github origin-dapp page](https://github.com/OriginProtocol/origin-dapp) and create a PR.
 Make sure to use as a base branch ***hidefeature_list***.

