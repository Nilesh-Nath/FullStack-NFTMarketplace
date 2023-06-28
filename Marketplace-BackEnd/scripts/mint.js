const { deployments, ethers } = require("hardhat");

async function mint() {
  const basicNft = await ethers.getContract("BasicNft");

  console.log("Minting....");
  const tx = await basicNft.mintNft();
  const txResponse = await tx.wait(1);
  const tokenId = txResponse.events[1].args.tokenId;
  console.log(`Minted and Token ID of NFT is ${tokenId}.`);
  console.log(`NFT address is ${basicNft.address}`);
}

mint()
  .then(() => process.exit(0))
  .then((error) => {
    console.error(error);
    process.exit(-1);
  });
