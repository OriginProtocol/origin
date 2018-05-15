#!/usr/local/bin/node
/////////////////////////////////////////////////
// Usage:   node migrate.js [-h] -c CONFIGFILE -d DATAFILE -a {read,write}
// Ex.      node migrate.js -c ./conf-test.json -d ./data.json -a read
//          node migrate.js -c ./conf-test.json -d ./data.json -a write
//
// This script migrates listings from a source contract to a
// destination contract. Notes:
//     - the lister of the migrated listings is the account that performed the
// migration, rather than the original lister.
//     - the migration can be tested by setting "dst_*" vars to localhost values
//     - if any source listing has an IPFS hash that already exists in the destination, that listing is not migrated
//
// Script parameters:
//
//   config (json):
//     srcNetworkName, dstNetworkName
//     srcGateway, dstGateway
//     srcListingAddress_v0_1, dstListingsRegistryAddress_v0_2
//     privateKey: of account to send txns to ListingsRegistry#Create from
//     gasSafetyMarginMultiplier
//     numConfirmations: # to wait before listing is considered migrated
//
//
//   data_file (json): when migrating, listings are read from the source 
//                     contract and written to this file, then read from
//                     this file and written to the destination contract
//
//   action:
//     read:  read listings from source contract to data file
//     write: write listings from data file to destination contract
/////////////////////////////////////////////////
const Web3 = require('web3');
const bs58 = require('bs58');
const ArgumentParser = require('argparse').ArgumentParser;
const fs = require('fs');

const POLL_INTERVAL = 10000;
const RETRY_INTERVAL = 10000;
const BACKOFF_FACTOR = 1.5;
const MAX_RETRIES = 5;

const listingAbi_v0_1 = require("./Listing_v0_1");
const listingsRegistryAbi_v0_2 = require("./ListingsRegistry_v0_2")['abi'];

const parser = new ArgumentParser({addHelp: true});
parser.addArgument(['-c', '--configFile'], {help: 'config file path', required: true});
parser.addArgument(['-d', '--dataFile'] ,{help: 'data file path', required: true});
parser.addArgument(['-a', '--action'], {help: 'action: \'read\' or \'write\'', required: true, choices: ['read', 'write']});
const args = parser.parseArgs();

Array.prototype.remove = function(el) {
    var index = this.indexOf(el);
    if (index > -1) {
        return this.splice(index, 1);
    } else {
        return this;
    }
}

try {
    var config = require(args.configFile);
} catch(e) {
    console.log("Error loading config file: " + e);
    process.exit();
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
function Migration(config, dataFile) {
    this.srcNetworkName = config.srcNetworkName;
    this.dstNetworkName = config.dstNetworkName;
    this.srcGateway = config.srcGateway;
    this.dstGateway = config.dstGateway;
    this.srcListingAddress_v0_1 = config.srcListingAddress_v0_1;
    this.dstListingsRegistryAddress_v0_2 = config.dstListingsRegistryAddress_v0_2;
    this.privateKey = config.privateKey;
    this.gasMultiplier = config.gasSafetyMarginMultiplier;
    this.numConfirmations = config.numConfirmations;

    this.dataFile = dataFile;

    this.web3 = null;
    this.contractAddress = null;
    this.account = null;

    this.submittedListings = [];
    this.minedListings = [];
    this.confirmedListings = [];
    this.errors = [];

    return this;
}
/////////////////////////////////////////////////
// from origin-js#contract-service.js
Migration.prototype.getBytes32FromIpfsHash = function(ipfsListing) {
    return (
        "0x" +
        bs58
          .decode(ipfsListing)
          .slice(2)
          .toString("hex")
    )
}
// Return base58 encoded ipfs hash from bytes32 hex string,
Migration.prototype.getIpfsHashFromBytes32 = function(bytes32Hex) {
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, "hex")
    const hashStr = bs58.encode(hashBytes)
    return hashStr
}

// If any source listing has an IPFS hash that already exists in the destination, that listing is not migrated
Migration.prototype.checkDuplicates = async function(sourceListings, numDestinationListings) {
    console.log("Checking for duplicates...")

    destinationListings = await this.getAllListings(numDestinationListings);
    const sourceListingsHashes = Object.keys(sourceListings).map((id) => sourceListings[id].ipfsHash);
    const destinationListingsHashes = Object.keys(destinationListings).map((id) => destinationListings[id].ipfsHash);
    const [lowerCardinalityArray, higherCardinalityArray] = (sourceListingsHashes.length < destinationListingsHashes.length) ? [sourceListingsHashes, destinationListingsHashes] : [destinationListingsHashes, sourceListingsHashes];

    let duplicates = [];
    lowerCardinalityArray.map((ipfsHash) => {
        if (higherCardinalityArray.indexOf(ipfsHash) > -1) {
            duplicates.push(ipfsHash);
        }
    });

    // Halt the migration if duplicates are detected
    if (duplicates.length) {
        console.log("    Found duplicate listings: " + duplicates);
        console.log("Please remove these entries from the datafile before running the migration.");
        process.exit();
    } else {
        // stackoverflow/19687407
        console.log("No duplicate listings found.\n");
        console.log("Press any key to start the migration.");
        await async function() {
            process.stdin.setRawMode(true);
            return new Promise((resolve) => process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                resolve();
            }));
        }()
    }

    return sourceListings;
}

// Indexes for listings in ListingsRegistry are currently in a contiguous block
Migration.prototype.getAllListings = async function(numListings) {
    let getListingCalls = [];
    for(let i = 0; i < numListings; i++) {
        getListingCalls.push(this.getListing(i));
    }
    const listings = await Promise.all(getListingCalls);
    const retrievedListings = listings.filter((el) => el);
    return retrievedListings;
}

Migration.prototype.getListing = async function(index) {
    try {
        const listingData = await this.contract.methods.getListing(index).call();
        listing = {
            index: index,
            lister: listingData[1],
            ipfsHash: this.getIpfsHashFromBytes32(listingData[2]),
            price: String(listingData[3]), // in wei
            unitsAvailable: parseInt(listingData[4])
        }
        return listing;
    } catch(e) {
        console.log("error getting listing: " + e);
        return false;
    }
}

/**
 * Queries for the nonce and gas estimate, then create -> sign -> submit a
 * transaction. Returns the transaction hash.
 */
Migration.prototype.createListing = async function(listing) {
    const nonce = await this.web3.eth.getTransactionCount(this.account.address, "pending");
    console.log("   nonce: " + nonce);
    try {
        const ipfsHash = this.getBytes32FromIpfsHash(listing.ipfsHash);
        const unitsAvailable = listing.unitsAvailable;
        const price = this.web3.utils.toBN(listing.price);

        const contractFunction = this.contract.methods.create(ipfsHash, price, unitsAvailable);
        const gasAmount = await contractFunction.estimateGas({from: this.account.address});
        const estimatedGas = parseInt(gasAmount * this.gasMultiplier);
        console.log("   estimated gas: " + estimatedGas);

        const functionAbi = contractFunction.encodeABI();
        const tx = {
            from: this.account.address,
            to: this.contractAddress,
            gas: estimatedGas,
            data: functionAbi,
            nonce: this.web3.utils.toHex(nonce)
        };

        const signedTransaction = await this.web3.eth.accounts.signTransaction(tx, this.privateKey);
        const txHash = async function(web3) {
            return new Promise(function(resolve, reject) {
                web3.eth
                    .sendSignedTransaction(signedTransaction.rawTransaction, function(err, txHash) {
                        if (err) {
                            reject(err);
                        } else {
                            // Mark completed when transaction has been submitted
                            resolve(txHash);
                        }
                // Mark completed when transaction has been mined
                // }).on('receipt', (receipt) => {
                //     resolve(receipt);
                // }).on('error', (err) => {
                //     reject();
                });
            });
        }

        try {
            res = await txHash(this.web3);
            return res;
        } catch(e) {
            // failed to submit the transaction
            console.log("error submitting transaction: " + e);
            return false;
        }

    } catch(e) {
        // failed to create and sign the tranasction
        console.log("error creating transaction: " + e);
        return false;

    }
}

/**
* Using the transaction hashes, we can poll for the status of each listing
* as it is being migrated. All transactions start in a submitted state, and when
* a receipt becomes available we know that it has been mined. After
* numConfirmation additional blocks have been mined, the transaction is
* confirmed. There isn't a concept of transaction finality (before Casper is
* implemented), but the probability that a block will be reverted after 6
* confirmations is extremely low.
*/
Migration.prototype.confirm = async function(txToListings) {
    const numTotalTransactions = Object.keys(txToListings).length;
    while (true) {
        console.log("<<<<<<<<<<<<<< polling >>>>>>>>>>>>>>>");
        const currentBlockRequest = this.web3.eth.getBlockNumber();
        let pendingRequests = [currentBlockRequest];
        Object.keys(txToListings).map((txHash) => {
            pendingRequests.push(this.web3.eth.getTransactionReceipt(txHash));
        });

        try {
            const responses = await Promise.all(pendingRequests);
            const currentBlock = responses[0];
            console.log("    current block: " + currentBlock);
            const receipts = responses.slice(1).filter((el) => el);
            console.log("    recieved receipts for: " + receipts.length + " listings.")

            // If there is a receipt, we know that the block has been mined
            for (let i = 0; i < receipts.length; i++) {
                const receipt = receipts[i];
                const blockNumber = receipt.blockNumber;
                const txHash = receipt.transactionHash;
                const listingID = txToListings[txHash];
                this.submittedListings.remove(listingID);

                if ((currentBlock - blockNumber) >= (this.numConfirmations - 1)) {
                    this.confirmedListings.push(listingID);
                    this.minedListings.remove(listingID);
                    delete txToListings[txHash];
                } else {
                    if (this.minedListings.indexOf(listingID) == -1) {
                        this.minedListings.push(listingID);
                    }
                }
            }

                console.log("    submitted: " + this.submittedListings.length + " | mined: " + this.minedListings.length + " | confirmed: " + this.confirmedListings.length);
                if (this.confirmedListings.length == numTotalTransactions) {
                    return true;
                }

        } catch(e) {
            console.log("Request error: " + e + ", continuing to next interval.");
            console.log("Pressing CTRL+C will print current state before exiting.");
        }

        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
}

/**
 * Gets number of listings, then spawns requests to retrieve the
 * listing data. When all requests have completed, the ones that returned
 * listings are written to the data file.
 */
Migration.prototype.read = async function() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.srcGateway));
    this.contractAddress = this.srcListingAddress_v0_1;
    this.contract = new this.web3.eth.Contract(listingAbi_v0_1, this.contractAddress);


    console.log("Source contract address: " + this.contractAddress);
    const numListings = await this.contract.methods.listingsLength().call();
    console.log("Found " + numListings + " listings.");

    if (numListings == 0) {
        process.exit();
    }

    retrievedListings = await this.getAllListings();
    console.log("Retrieved " + retrievedListings.length + " listings from source contract.");

    var output = {};
    retrievedListings.map((listing) => output[listing.index] = listing);

    fs.writeFile(this.dataFile, JSON.stringify(output, null, 4), () => {
        console.log("Wrote " + Object.keys(output).length + " listings to data file: " + this.dataFile);
    });
}

/**
 * Reads listings to migrate from the data file, then spawns requests to create
 * listings.
 *     The returned transaction hashes are then passed to a method to poll the
 * provider for the status of the transactions:
 * [submitted] -> [included in a mined block] -> [reached n confirmations]
 */
Migration.prototype.write = async function() {
    try {
        var sourceListings = require(this.dataFile);
        console.log("Read " + Object.keys(sourceListings).length + " listings from data file.");
    } catch (e) {
        console.log("Error loading data file: " + e);
        process.exit();
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.dstGateway));
    this.contractAddress = this.dstListingsRegistryAddress_v0_2;
    this.contract = new this.web3.eth.Contract(listingsRegistryAbi_v0_2, this.contractAddress);

    const privateKey = this.privateKey;

    const gasMultiplier = parseFloat(this.gasMultiplier);
    const numConfirmations = parseInt(this.numConfirmations);

    console.log("Destination contract address: " + this.contractAddress);
    console.log("Gas multiplier: " + gasMultiplier);
    console.log("# Confirmations to wait: " + numConfirmations);

    this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    console.log("Creating listings using account: " + this.account.address);
    console.log("--------------------------------------------");

    const startingNumListings = await this.contract.methods.listingsLength().call();
    console.log("Starting # listings in ListingsRegistry: " + startingNumListings);

    const listings = await this.checkDuplicates(sourceListings, startingNumListings);
    console.log("--------------------------------------------");
    console.log("    Migrating " + Object.keys(listings).length + " listings.")
    console.log("--------------------------------------------");

    const listingIDs = Object.keys(listings).map((id) => parseInt(id));
    const numListings = listingIDs.length;

    var txToListings = {};

    let numRetries = 0;
    for (i = 0; i < numListings; i++) {
        const listingID = listingIDs[i];
        console.log("Submitting listing: " + listingID);
        txHash = await this.createListing(listings[listingID], this.account);
        if (txHash) {
            numRetries = 0;
            txToListings[txHash] = listingID;
            this.submittedListings.push(listingID);
        } else {
            // Retry logic
            if (numRetries < MAX_RETRIES) {
                i -= 1;
                let retryInterval = null;
                if (numRetries > 0) {
                    retryInterval =  RETRY_INTERVAL * Math.pow(BACKOFF_FACTOR, numRetries);
                } else {
                    retryInterval = RETRY_INTERVAL;
                }
                numRetries += 1;
                console.log("    Retrying after " + retryInterval/1000.0 + " seconds");
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            } else {
                console.log("    Listing " + listingID + " exceeded retry limit.");
                this.errors.push(listingID);
            }
        }
    };

    console.log("--------------------------------------------");
    console.log("Submitted " + this.submittedListings.length + " listings");

    await this.confirm(txToListings);

    console.log("--------------------------------------------");
    console.log("Listings have " + this.numConfirmations + " confirmations.");

    // Query the contract for the number of listings created, which should
    // equal the number of listings we have recorded as migrated.
    const endingNumListings = await this.contract.methods.listingsLength().call();
    console.log("Ending # listings in ListingsRegistry: " + endingNumListings + " (" + (endingNumListings - startingNumListings) + " created)");

    this.printResults();

    this.checkData(listings, startingNumListings, endingNumListings);
    process.exit();
}

//   (mined listings - errors).shouldEqual(# created in ListingsRegistry)
//   (mined listings).shouldEqual(confirmed listings)
Migration.prototype.printResults = function() {
    console.log("--------------------------------------------");
    console.log("Results:")
    console.log(this.submittedListings.length + " listing currently in submitted state: " + this.submittedListings);
    console.log(this.minedListings.length + " listings currently in mined state: " + this.minedListings);
    console.log(this.confirmedListings.length + " listings migrated: " + this.confirmedListings);
    console.log(this.errors.length + " errors: " + this.errors);
}

/////////////////////////////////////////////////
// Entrypoint
/////////////////////////////////////////////////
var migration = new Migration(config, args.dataFile);

if (args.action == 'read') {
    console.log("Reading listings from: " + config.srcNetworkName + " - Gateway: " + config.srcGateway);
    console.log("--------------------------------------------");

    try {
        migration.read();
    } catch(e) {
        console.log("Error reading listings data: " + e);
        process.exit();
    }

} else if (args.action == 'write') {
    console.log("Creating listings on: " + config.dstNetworkName + " - Gateway: " + config.dstGateway);
    console.log("--------------------------------------------");

    // Assumes no listings in data file have been migrated
    // TODO: check for and flag duplicate listings in destination contract (using IPFS hash)
    try {
        migration.write();
    } catch(e) {
        console.log("Error creating listings: " + e);
        process.exit();
    }

    // allow the operator to CTRL+C for the cases where:
    //   - some listings to never get mined
    //   - some listings to never reach numConfirmations
    process.on('SIGINT', function() {
        console.log("--------------------------------------------");
        console.log("CTRL+C detected");
        migration.printResults();
        process.exit();
    });
}