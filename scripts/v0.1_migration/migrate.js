// Usage: 	node migrate.js [-h] -c CONFIGFILE -d DATAFILE -a {read,write}
// Ex.		node migrate.js -c ./conf-test.json -d ./data.json -a read

// config (json):
//	from_network_name, to_network_name
// 	from_gateway, to_gateway
// 	from_listing_address_v0_1, to_listings_registry_address_v0_2

// test the migration by setting "to_*" vars to localhost values

// data_file (json): file to which listings will be read to and migrated from

// action:
//	read: read listings from blockchain to data file
// 	write: write listings from data file to blockchain, record migration status for each listing
var Web3 = require('web3');
var ArgumentParser = require('argparse').ArgumentParser;

var fs = require('fs');

var listing_abi_v0_1 = require("./Listing_v0_1");
var listings_registry_abi_v0_2 = require("./ListingsRegistry_v0_2")['abi'];

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
	console.log("Error loading config file: " + e)
	process.exit()
}

// todo: data file is writeable/readable
// console.log("Invalid data file: " + e)

if (args.action == 'read') {
	console.log("Reading from: " + config.fromNetworkName + " - Gateway: " + config.fromGateway)
	web3 = new Web3(new Web3.providers.HttpProvider(config.fromGateway))

	let address = config.fromListingAddress_v0_1
	let contract = new web3.eth.Contract(listings_registry_abi_v0_2, address);

	contract.methods.listingsLength().call().then((numListings) => {
		console.log("Found " + numListings + " listings.")
		if (numListings == 0) {
			process.exit()
		}

		let getListingCalls = []

		for(let i = 0; i < numListings; i++) {
			getListingCalls.push(contract.methods.getListing(i).call().then((listingData) => {
				listing = {
					lister: listingData[1],
					ipfsHash: listingData[2],
					price: parseInt(listingData[3]), // in wei
					unitsAvailable: parseInt(listingData[4]),
					migrated: false
				}

				return listing;
			}))
		}

		Promise.all(getListingCalls).then((listings) => {
			fs.writeFile(args.dataFile, JSON.stringify(listings), () => {
			console.log("Wrote " + listings.length + " listings to: " + args.dataFile)
		});
		})

	}).catch((e) => {
		console.log("error reading listings data: " + e)
		process.exit()
	});

} else if (args.action == 'write') {
	// require a method to create a listing while setting lister to an address other than msg.sender
}
