const NftID = artifacts.require('NftID')

module.exports = function (deployer) {
  deployer.deploy(NftID);
};
