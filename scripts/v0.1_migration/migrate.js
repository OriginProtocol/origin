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
//     batchSize: not currently used
//
//
//   data_file (json): when migrating, listings are read from the source 
//                     contract and written to this file, then read from
//                     this file and written to the destination contract
//
//   action:
//     read:  read listings from source contract to data file
//     write: write listings from data file to destination contract, 
//            recording migration status for each listing

/////////////////////////////////////////////////
// from origin-js#contract-service.js
const bs58 = require('bs58');
// Return bytes32 hex string from base58 encoded ipfs hash,
function getBytes32FromIpfsHash(ipfsListing) {
    return (
        "0x" +
        bs58
          .decode(ipfsListing)
          .slice(2)
          .toString("hex")
    )
}
// Return base58 encoded ipfs hash from bytes32 hex string,
function getIpfsHashFromBytes32(bytes32Hex) {
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, "hex")
    const hashStr = bs58.encode(hashBytes)
    return hashStr
}
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const ArgumentParser = require('argparse').ArgumentParser;

const fs = require('fs');

const listingAbi_v0_1 = require("./Listing_v0_1");
const listingsRegistryAbi_v0_2 = require("./ListingsRegistry_v0_2")['abi'];

const parser = new ArgumentParser({addHelp: true});
parser.addArgument(
    ['-c', '--configFile'],
    {
        help: 'config file path',
        required: true
    }
);
parser.addArgument(
    ['-d', '--dataFile'],
    {
        help: 'data file path',
        required: true
    }
);
parser.addArgument(
    ['-a', '--action'],
    {
        help: 'action: \'read\' or \'write\'',
        required: true,
        choices: ['read', 'write']
    }
);

const args = parser.parseArgs();

try {
    var config = require(args.configFile);
} catch(e) {
    console.log("Error loading config file: " + e);
    process.exit();
}

/////////////////////////////////////////////////
if (args.action == 'read') {
    console.log("Reading from network: " + config.srcNetworkName + " - Gateway: " + config.srcGateway);
    console.log("--------------------------------------------")

    const web3 = new Web3(new Web3.providers.HttpProvider(config.srcGateway));

    const srcContractAddress = config.srcListingAddress_v0_1;
    const srcContract = new web3.eth.Contract(listingAbi_v0_1, srcContractAddress);

    srcContract.methods.listingsLength().call().then((numListings) => {
        console.log("Found " + numListings + " listings.")
        if (numListings == 0) {
            process.exit();
        }

        let getListingCalls = [];

        for(let i = 0; i < numListings; i++) {
            getListingCalls.push(srcContract.methods.getListing(i).call().then((listingData) => {
                listing = {
                    index: i,
                    lister: listingData[1],
                    ipfsHash: getIpfsHashFromBytes32(listingData[2]),
                    price: String(listingData[3]), // in wei, needs to be a string
                    unitsAvailable: parseInt(listingData[4]),
                    migrated: false
                }

                return listing;
            }).catch((e) => {
                return false;
            }))
        }

        Promise.all(getListingCalls).then((listings) => {
            const retrievedListings = listings.filter((el) => el);
            console.log("Retrieved " + retrievedListings.length + " listings from source contract.");

            var output = {};
            retrievedListings.map((listing) => output[listing.index] = listing);

            fs.writeFile(args.dataFile, JSON.stringify(output, null, 4), () => {
                console.log("Wrote " + Object.keys(output).length + " listings to data file: " + args.dataFile);
            });
        })

    }).catch((e) => {
        console.log("Error reading listings data: " + e);
        process.exit();
    });

/////////////////////////////////////////////////
} else if (args.action == 'write') {
    console.log("Writing to network: " + config.dstNetworkName + " - Gateway: " + config.dstGateway);
    console.log("--------------------------------------------")

    // Assumes no listings in data file have been migrated
    // TODO: check for and flag duplicate listings in destination contract (using IPFS hash)
    try {
        var listings = require(args.dataFile);
        console.log("Read " + Object.keys(listings).length + " listings from data file.");
    } catch (e) {
        console.log("Error loading data file: " + e);
        process.exit();
    }

    const web3 = new Web3(new Web3.providers.HttpProvider(config.dstGateway));

    const privateKey = config.privateKey;
    const dstContractAddress = config.dstListingsRegistryAddress_v0_2;
    const dstContract = new web3.eth.Contract(listingsRegistryAbi_v0_2, dstContractAddress);
    const gasSafetyMarginMultiplier = parseFloat(config.gasSafetyMarginMultiplier);
    // TODO
    // const numConfirmations = parseInt(config.numConfirmations);
    // const batchSize = parseInt(config.batchSize);

    console.log("Destination contract address: " + dstContractAddress);
    console.log("Gas multiplier: " + gasSafetyMarginMultiplier);
    // console.log("# Confirmations to wait: " + numConfirmations);
    // console.log("Batch size: " + batchSize);
    dstContract.methods.listingsLength().call().then((currentNumListings) => {
        console.log("Starting number of listings: " + currentNumListings);
    })
    console.log("--------------------------------------------")

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // TODO
    // var output = []

    const listingIDs = Object.keys(listings).map((id) => parseInt(id));

    web3.eth.getTransactionCount(account.address, "pending").then((baseNonce) => {
        console.log("Base nonce: " + baseNonce);

        // temporary, for nonce calculation
        var lowbound = parseInt(listingIDs[0]);

        listingIDs.map((listingID) => {
        setTimeout(function() {    
            console.log("    Migrating listing: " + listingID);
            console.log(parseInt(listingID) - lowbound)
            let calculatedNonce = baseNonce + listingID - lowbound;
            console.log("Calculated nonce: " + calculatedNonce)

            try {
                const listing = listings[listingID];
                const ipfsHash = getBytes32FromIpfsHash(listing.ipfsHash);
                const unitsAvailable = listing.unitsAvailable;
                const price = web3.utils.toBN(listing.price);

                const contractFunction = dstContract.methods.create(ipfsHash, price, unitsAvailable);
                contractFunction.estimateGas({from: account.address}).then((gasAmount) => {
                    const estimatedGas = parseInt(gasAmount * gasSafetyMarginMultiplier);
                    // console.log("Estimated gas: " + estimatedGas);

                    const functionAbi = contractFunction.encodeABI();
                    const tx = {
                        from: account.address,
                        to: dstContractAddress,
                        gas: estimatedGas,
                        data: functionAbi,
                        nonce: web3.utils.toHex(calculatedNonce)
                    };

                    web3.eth.accounts.signTransaction(tx, privateKey).then((signed) => {
                        const transaction = web3.eth
                        .sendSignedTransaction(signed.rawTransaction)
                        // May want to measure confirmations by getting the receipt and doing <current_block - mined_block>
                        // .on('receipt', (receipt) => {
                        //     console.log('=> reciept');
                        //     console.log(receipt);
                        // })
                        .on('confirmation', (confirmationNumber, receipt) => {
                            // exits after 24 confirmations
                            // console.log(listingID + " " + confirmationNumber);
                            // one option to implement early exit + control flow:
                            // if (confirmationNumber == 2) {
                            // do something
                            // }
                        })
                        .on('error', (e) => {
                            console.log("ERROR on listing ID: " + listingID)
                            console.log()

                            throw(e);
                        });
                    });


                });
            } catch(e) {
                // console.log(e);
                console.log("listing failed: " + listingID);
            }
        // setTimeout
        },(parseInt(listingID) - lowbound) * 100)


        });

    });

    // dstContract.methods.listingsLength().call().then((currentNumListings) => {
    //     console.log("Ending number of listings: " + currentNumListings);
    // })

}