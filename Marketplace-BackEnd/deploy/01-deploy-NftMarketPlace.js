const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  const args = [];

  log("Deploying NFT Marketplace....");
  const nftMarketPlace = await deploy("NftMarketPlace", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("NFT Marketplace Deployed !!!!");
  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying....");
    await verify(nftMarketPlace.address, args);
  }
};

module.exports.tags = ["all", "marketplace"];
