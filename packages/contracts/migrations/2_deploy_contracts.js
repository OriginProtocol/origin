// var Listing = artifacts.require("./Listing.sol");
var ListingsRegistry = artifacts.require("./ListingsRegistry.sol");

// console.log(Listing)
console.log(ListingsRegistry)

module.exports = function(deployer) {
  // deployer.deploy(Listing, ListingsRegistry);
  // deployer.deploy(Listing);
  deployer.deploy(ListingsRegistry);
};


// module.exports = function(deployer) {
//     deployer.deploy(Listing).then(function() {
//         return deployer.deploy(ListingsRegistry).then(function() {
//         	console.log("Deployed")
//         });
//     });
// };

