// Usage: 	node migrate.js [-h] -c CONFIGFILE -d DATAFILE -a {read,write}
// Ex.		node migrate.js -c ./conf-test.json -d ./data.json -a read
//
// test the migration by setting "to_*" vars to localhost values
//
// TODOs:
//   check for any duplicate IPFS hashes before migrating
//
// Args:
//   config (json):
//	   srcNetworkName, toNetworkName
// 	   srcGateway, toGateway
// 	   srcListingAddress_v0_1, dstListingsRegistryAddress_v0_2
//
//   data_file (json): a file which listings to migrate will be written to and read from 
//
//   action:
//	   read: read listings from blockchain to data file
// 	   write: write listings from data file to blockchain, record migration status for each listing
//		      Assumes all listings in data file have not been migrated

/////////////////////////////////////////////////
// from origin-js#contract-service.js
var bs58 = require('bs58')
function getBytes32FromIpfsHash(ipfsListing) {
    return (
      "0x" +
      bs58
        .decode(ipfsListing)
        .slice(2)
        .toString("hex")
    )
  }
/////////////////////////////////////////////////
var Web3 = require('web3');
var ArgumentParser = require('argparse').ArgumentParser;

var fs = require('fs');

var listingAbi_v0_1 = require("./Listing_v0_1");
var listingsRegistryAbi_v0_2 = require("./ListingsRegistry_v0_2")['abi'];

var parser = new ArgumentParser({addHelp: true});
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

var args = parser.parseArgs();

try {
	var config = require(args.configFile);
} catch(e) {
	console.log("Error loading config file: " + e);
	process.exit();
}

if (args.action == 'read') {
	console.log("Reading from network: " + config.srcNetworkName + " - Gateway: " + config.srcGateway);
	web3 = new Web3(new Web3.providers.HttpProvider(config.srcGateway));

	let srcAddress = config.srcListingAddress_v0_1;
	let srcContract = new web3.eth.Contract(listingAbi_v0_1, srcAddress);

	srcContract.methods.listingsLength().call().then((numListings) => {
		console.log("Found " + numListings + " listings.")
		if (numListings == 0) {
			process.exit();
		}

		let getListingCalls = []

		for(let i = 0; i < numListings; i++) {
			getListingCalls.push(srcContract.methods.getListing(i).call().then((listingData) => {
				listing = {
					lister: listingData[1],
					ipfsHash: listingData[2],
					price: parseInt(listingData[3]), // in wei
					unitsAvailable: parseInt(listingData[4]),
					migrated: false
				}

				return listing;
			}).catch((e) => {
				return false;
			}))
		}

		Promise.all(getListingCalls).then((listings) => {
			retrievedListings = listings.filter((el) => el);
			console.log("Retrieved " + retrievedListings.length + " listings.");

			fs.writeFile(args.dataFile, JSON.stringify(retrievedListings, null, 4), () => {
				console.log("Wrote " + retrievedListings.length + " listings to: " + args.dataFile);
			});
		})

	}).catch((e) => {
		console.log("Error reading listings data: " + e);
		process.exit();
	});

} else if (args.action == 'write') {
	console.log("Writing to network: " + config.dstNetworkName + " - Gateway: " + config.dstGateway);

	try {
		var listings = require(args.dataFile);
		console.log("Read " + listings.length + " listings.");
	} catch (e) {
		console.log("Error loading data file: " + e);
		process.exit();
	}

	web3 = new Web3(new Web3.providers.HttpProvider(config.dstGateway));

	let dstAddress = config.dstListingsRegistryAddress_v0_2;
	let dstContract = new web3.eth.Contract(listingsRegistryAbi_v0_2, dstAddress);

	var account = config.account;
	var privateKey = config.;

	listingData = {
		_ipfsHash: listings[0].ipfsHash,
		_price: listings[0].price,
		_unitsAvailable: listings[0].unitsAvailable
	}

	// Issue #1
	// IPFS hash taken from listing gives an error. The Solidity type is bytes32, but that may be different than the format required here, or perhaps a conversion is required upon reading from the contract
	// working ipfs hash: getBytes32FromIpfsHash('QmU4cYFPkWbrdfbRFvpGvHsWZtKAGRaAL4CFuaLhfVcrL2')
	let methodCall = dstContract.methods.create(listingData._ipfsHash,listingData.price,listingData.unitsAvailable)

	// Issue #2
	// transaction returns "Error: Returned error: sender account not recognized", but a call to web3.eth.getBalance() returns a value
	methodCall.send({ from: account, gas: 4476768 })


	// TODOs
	// wait N confirmations before marking listing as migrated (conf: # confirmations)
	// parallelize listing creation (conf: batch size)

}