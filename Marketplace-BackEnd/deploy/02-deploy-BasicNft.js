const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  const arguments = [];

  log("Deploying Basic NFT....");
  const basicNft = await deploy("BasicNft", {
    from: deployer,
    log: true,
    args: arguments,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("Basic NFT Deployed !!!!");

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying....");
    await verify(basicNft.address, arguments);
  }
};

module.exports.tags = ["all", "basicNft"];
