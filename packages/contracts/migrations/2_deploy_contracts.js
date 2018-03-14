var ListingsRegistry = artifacts.require("./ListingsRegistry.sol");
var UserRegistry = artifacts.require("./UserRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ListingsRegistry);
  deployer.deploy(UserRegistry);
};