var FoodTrack = artifacts.require("./FoodTrack.sol");

module.exports = function(deployer) {
  deployer.deploy(FoodTrack);
};
