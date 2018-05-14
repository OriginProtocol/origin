#!/usr/local/bin/node

// Usage:   node migrate.js [-h] -c CONFIGFILE -d DATAFILE -a {read,write}
// Ex.      node migrate.js -c ./conf-test.json -d ./data.json -a read
//          node migrate.js -c ./conf-test.json -d ./data.json -a write
//
// test the migration by setting "dst_*" vars to localhost values
//
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

// polling interval for checking confirmations
const POLL_INTERVAL = 1000;

const listingAbi_v0_1 = require("./Listing_v0_1");
const listingsRegistryAbi_v0_2 = require("./ListingsRegistry_v0_2")['abi'];

const parser = new ArgumentParser({addHelp: true});
parser.addArgument(['-c', '--configFile'], {help: 'config file path', required: true});
parser.addArgument(['-d', '--dataFile'] ,{help: 'data file path', required: true});
parser.addArgument(['-a', '--action'], {help: 'action: \'read\' or \'write\'', required: true, choices: ['read', 'write']});
const args = parser.parseArgs();

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

Migration.prototype.getListing = async function(index) {
    try {
        const listingData = await this.contract.methods.getListing(index).call();
        listing = {
            index: index,
            lister: listingData[1],
            ipfsHash: this.getIpfsHashFromBytes32(listingData[2]),
            price: String(listingData[3]), // in wei
            unitsAvailable: parseInt(listingData[4]),
            migrated: false
        }
        return listing;
    } catch(e) {
        return false;
    }
}

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
                            reject();
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
            res = await txHash(this.web3)
            return res;
        } catch(e) {
            // failed to submit the transaction
            return false;
        }

    } catch(e) {
        // failed to create and sign the tranasction
        return false;

    }
}

Migration.prototype.confirm = async function(submittedListings) {
    // setInterval(() => {
    //     // currentBlock = await web3.eth.getBlockNumber()
    //     //Promise.all(submittedListings)
    //     //if web3.eth.getTransactionReceipt(hash) for a submittedListing
    //     //  confirmations = currentBlock - block
    //     //  if > this.numConfirmations this.confirmedListrings
    //     //  else this.minedListings
    //     //  update listings to block
    //     //  remove from object

    //     this.minedListings
    //     this.confirmedListings
    // }, POLL_INTERVAL)
}

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

    let getListingsCalls = [];

    for(let i = 0; i < numListings; i++) {
        getListingsCalls.push(this.getListing(i));
    }

    const listings = await Promise.all(getListingsCalls);
    const retrievedListings = listings.filter((el) => el);
    console.log("Retrieved " + retrievedListings.length + " listings from source contract.");

    var output = {};
    retrievedListings.map((listing) => output[listing.index] = listing);

    fs.writeFile(this.dataFile, JSON.stringify(output, null, 4), () => {
        console.log("Wrote " + Object.keys(output).length + " listings to data file: " + this.dataFile);
    });
}

Migration.prototype.write = async function() {
    try {
        var listings = require(this.dataFile);
        console.log("Read " + Object.keys(listings).length + " listings to migrate from data file.");
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

    const startingNumListings = await this.contract.methods.listingsLength().call();
    console.log("Starting # listings in ListingsRegistry: " + startingNumListings);
    console.log("--------------------------------------------")

    this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);

    const listingIDs = Object.keys(listings).map((id) => parseInt(id));
    const numListings = listingIDs.length;

    var submittedListings = {};

    for (i = 0; i < numListings; i++) {
        const listingID = listingIDs[i];
        console.log("Submitting listing: " + listingID);
        txHash = await this.createListing(listings[listingID], this.account);
        if (txHash) {
            submittedListings[listingID] = txHash;
        } else {
            this.errors.push(listingID);
        }
    };

    console.log("--------------------------------------------")
    console.log("Submitted " + Object.keys(submittedListings).length + " listings");

    // TBD
    // await this.confirm(submittedListings);

    console.log("--------------------------------------------")
    console.log("All submitted listings were mined and reached " + this.numConfirmations + " confirmations.");

    const endingNumListings = await this.contract.methods.listingsLength().call();
    console.log("Ending # listings in ListingsRegistry: " + endingNumListings + " (" + (endingNumListings - startingNumListings) + ") created");

    this.printResults();
    process.exit();
}

// There could be a listing that gets:
//   - submitted but is not included in a block and mined
//   - included in a block and mined, but not yet 'finalized'/numConfirmations
//   - included in a block but there is a softfork (the code does not handle this case)
//
//   (mined listings - errors).shouldEqual(# created in ListingsRegistry)
//   (mined listings).shouldEqual(confirmed listings)
Migration.prototype.printResults = function() {
    console.log("--------------------------------------------")
    console.log("Results:")
    console.log(this.minedListings.length + " listings in mined transactions: " + this.minedListings);
    console.log(this.confirmedListings.length + " listings having " + this.numConfirmations + " confirmations: " + this.confirmedListings);
    console.log(this.errors.length + " errors: " + this.errors);
}


/////////////////////////////////////////////////
/////////////////////////////////////////////////
var migration = new Migration(config, args.dataFile);

if (args.action == 'read') {
    console.log("Reading listings from: " + config.srcNetworkName + " - Gateway: " + config.srcGateway);
    console.log("--------------------------------------------")

    try {
        migration.read();
    } catch(e) {
        console.log("Error reading listings data: " + e);
        process.exit();
    }

} else if (args.action == 'write') {
    console.log("Creating listings on: " + config.dstNetworkName + " - Gateway: " + config.dstGateway);
    console.log("--------------------------------------------")

    // Assumes no listings in data file have been migrated
    // TODO: check for and flag duplicate listings in destination contract (using IPFS hash)
    try {
        migration.write();
    } catch(e) {
        console.log("Error creating listings: " + e);
        process.exit();
    }

    // trap CTRL+C for the case:
    //   - some listings were never mined
    //   - some listings never reached numConfirmations
    process.on('SIGINT', function() {
        console.log("--------------------------------------------");
        console.log("CTRL+C detected");
        migration.printResults();
        process.exit()
    });
} // illegal actions should be caught by ArgumentParser