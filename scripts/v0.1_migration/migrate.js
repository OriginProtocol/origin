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
}