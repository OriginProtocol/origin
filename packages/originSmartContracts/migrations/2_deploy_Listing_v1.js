var Listing = artifacts.require("./Listing.sol");

module.exports = function(deployer) {
  deployer.deploy(Listing);
};
