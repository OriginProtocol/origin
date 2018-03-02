var UserRegistry = artifacts.require("./UserRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(UserRegistry);
};
