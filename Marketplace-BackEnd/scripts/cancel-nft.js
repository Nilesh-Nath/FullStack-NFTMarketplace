const { ethers } = require("hardhat");

async function cancelNft() {
  const basicNft = await ethers.getContract("BasicNft");
  // 0xdf886676b2ee71d00db84d4afbde6e9c81bac0e6
  const nftAddress = "0xdf886676b2ee71d00db84d4afbde6e9c81bac0e6";
  const tokenId = "0";
  console.log(basicNft.address);
  const marketplace = await ethers.getContract("NftMarketPlace");
  console.log(marketplace.address);
  console.log("Cancelling.....");
  const tx = await marketplace.cancelNft(nftAddress, tokenId);
  const txResponse = await tx.wait(1);
}

cancelNft()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
