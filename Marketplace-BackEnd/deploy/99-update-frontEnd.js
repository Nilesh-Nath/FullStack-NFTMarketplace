const fs = require("fs");
const { ethers, network } = require("hardhat");
const {
  frontEndAbiLocation,
  frontEndContractFile,
} = require("../helper.hardhat");

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating Frontend....");
    await updateContractAddress();
    await updateAbi();
  }
};

async function updateAbi() {
  const nftMarketplace = await ethers.getContract("NftMarketPlace");
  fs.writeFileSync(
    `${frontEndAbiLocation}NftMarketplace.json`,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );

  const basicNft = await ethers.getContract("BasicNft");
  fs.writeFileSync(
    `${frontEndAbiLocation}BasicNft.json`,
    basicNft.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddress() {
  const nftMarketplace = await ethers.getContract("NftMarketPlace");
  const chainId = network.config.chainId;

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractFile, "utf-8")
  );

  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["NftMarketPlace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["NftMarketPlace"].push(nftMarketplace.address);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
  }

  fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];
