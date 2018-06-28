# Listings Migration

Script to migrate listings that are stored in ListingsRegistry to using ListingsRegistryStorage to store the listings. It can read listings to a local file, and then create new listings from that local file.

## Step 1: Configuration

Edit the `conf-sample.json` configuration file or create a new one that looks like this:

```
{
	"srcNetworkName": "Rinkeby", // Ropsten or Rinkeby
	"dstNetworkName": "Local", // Local, Ropsten, or Rinkeby
	"srcGateway": "https://rinkeby.infura.io", // https://ropsten.infura.io, https://rinkeby.infura.io etc.
	"dstGateway": "http://localhost:8545", // http://localhost:8545, https://ropsten.infura.io, etc.
	"listingsRegistryAddress": "0x94dE52186b535cB06cA31dEb1fBd4541A824aC6d", // 0xAddress. Rinkeby: 0x94dE52186b535cB06cA31dEb1fBd4541A824aC6d, Ropsten: 0xE66c9c6168d14bE4C3c145f91890740CbDf9EC8B
	"newListingsRegistryAddress":"0xAddress", // Address of ListingsRegistry on dst
	"mnemonic": "<MNEMONIC>", // Wallet mnemonic for dst network
	"gasSafetyMarginMultiplier": 1.2,
	"numConfirmations": 1
}
```

## Step 2: Store old ListingsRegistry in local file

After filling out the configuration, execute the script in read mode, passing in the config file to use and a destination file.

```
$ node migrate_listings_registry_to_storage.js -c ./conf-test-ropsten-local.json -d ./ropsten-data.json -a read
Reading listings from: Ropsten - Gateway: https://ropsten.infura.io
---------------- ----------------------------
Source contract address: 0x2861f28756e14cf0733383be8aa66ba3b65f1b4e
Found 85 listings.
Retrieved 85 listings from source contract.
Wrote 85 listings to data file: ./ropsten-data.json
```

We now have a JSON file backup of the listings from the registry at `listingsRegistryAddress`.

## Step 3: Migrate data from local JSON file to new ListingsRegistry

Next, execute the script in write mode:
```
$ node migrate_listings_registry_to_storage.js -c ./conf-test-ropsten-local.json -d ./ropsten-data.json -a write`
```

This will populate the `ListingsRegistry` at `newListingsRegistryAddress` with the listings from the JSON file generated in step 2.

If there are duplicates the script will flag them:

```
Creating listings on: Local - Gateway: http://localhost:8545
--------------------------------------------
Read 85 listings from data file.
Destination contract address: 0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f
Gas multiplier: 1.2
# Confirmations to wait: 1
Creating listings using account: 0x627306090abab3a6e1400e9345bc60c78a8bef57
--------------------------------------------
Starting # listings in ListingsRegistry: 5
Checking for duplicates...
    Found duplicate listings: 0,1,2,3,4
Please remove these entries from the datafile before running the migration.
```

Remove the duplicate listings. Optionally, backup the data file before doing so. Then re-run the script.

```
Checking for duplicates...
No duplicate listings found.

Press any key to start the migration.
```

The script will start scrolling output as it sends transactions, checks confirmations, and prints the results:

```
Submitted 80 listings
<<<<<<<<<<<<<< polling >>>>>>>>>>>>>>>
    current block: 110
    recieved receipts for: 80 listings.
    submitted: 0 | mined: 0 | confirmed: 80
--------------------------------------------
Listings have 1 confirmations.
Ending # listings in ListingsRegistry: 85 (80 created)
--------------------------------------------
Results:
0 listing currently in submitted state:
0 listings currently in mined state:
80 listings migrated: 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84
0 errors:
--------------------------------------------
Checking data...
Checksums of the created listings and the ones in the datafile match.
```

## Notes

If the script needs to be stopped mid run or errors out, CTRL+C will print the output. The writes are pretty much atomic as far as I can tell (if you get a transaction receipt, the listing will get created. The next time the script is run, the duplicates check will tell you which listings have been written.

There's a special case here: if the script needs to be run multiple times, only the first run will have the accurate number of starting listings (since subsequent runs will pick up the listings that have already been migrated). The line (migrate_listings_registry_to_storage.js#397) "startingNumListings" has to be set to the number of created listings from the first run (if the ListingsRegistry was freshly created, it will be 0). Not doing so won't affect the actual migration, but the data integrity check at the end of the script uses the starting number of listings to query for the migrated data.
