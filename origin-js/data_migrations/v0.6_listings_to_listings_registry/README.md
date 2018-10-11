Script to migrate listings that are stored in the original listings contract to using a listings registry to store the listings

**Operating manual**

After filling out the configuration, execute the script in read mode:
```
amberts-MacBook-98:v0.1_migration ambertho$ node migrate.js -c ./conf-test.json -d ./rinkeby_listings.json -a read
Reading listings from: Rinkeby - Gateway: https://rinkeby.infura.io/
--------------------------------------------
Source contract address: 0x94dE52186b535cB06cA31dEb1fBd4541A824aC6d
Found 289 listings.
Retrieved 289 listings from source contract.
Wrote 289 listings to data file: ./rinkeby_listings.json
```

yay! now we have a json file backup of the listings.

then, execute the script in write mode:
`amberts-MacBook-98:v0.1_migration ambertho$ node migrate.js -c ./conf-test.json -d ./ropsten_listings.json -a write`

If there are duplicates the script will flag them:

```
Creating listings on: Local - Gateway: http://localhost:8545/
--------------------------------------------
Read 49 listings from data file.
Destination contract address: 0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f
Gas multiplier: 1.2
# Confirmations to wait: 6
Creating listings using account: 0x627306090abab3a6e1400e9345bc60c78a8bef57
--------------------------------------------
Starting # listings in ListingsRegistry: 288
Checking for duplicates...
    Found duplicate listings: 0,1,2,3,4
Please remove these entries from the datafile before running the migration.
```

Pretty self explanatory, just remove the duplicate listings. Optionally, backup the datafile before doing so. Rerun the script.

```
Checking for duplicates...
No duplicate listings found.

Press any key to start the migration.
```
The script will start scrolling output as it sends transactions, checks confirmations, and prints the results:

```
<<<<<<<<<<<<<< polling >>>>>>>>>>>>>>>
    current block: 371
    recieved receipts for: 1 listings.
    submitted: 0 | mined: 0 | confirmed: 44
--------------------------------------------
Listings have 6 confirmations.
Ending # listings in ListingsRegistry: 332 (44 created)
--------------------------------------------
Results:
0 listing currently in submitted state: 
0 listings currently in mined state: 
44 listings migrated: 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48
0 errors: 
--------------------------------------------
Checking data...
Checksums of the created listings and the ones in the datafile match.
```

If the script needs to be stopped mid run or errors out, CTRL+C will print the output. The writes are pretty much atomic as far as I can tell (if you get a transaction receipt, the listing will get created. The next time the script is run, the duplicates check will tell you which listings have been written.

There's a special case here: if the script needs to be run multiple times, only the first run will have the accurate number of starting listings (since subsequent runs will pick up the listings that have already been migrated). This line (https://github.com/OriginProtocol/origin-js/blob/issue/148_script_data_migration/scripts/v0.1_migration/migrate.js#L382) "startingNumListings" has to be set to the original number from the first run (if the ListingsRegistry was freshly created, it will be 0). Not doing so won't affect the actual migration, but the data integrity check at the end of the script uses the starting number of listings to query for the migrated data.
