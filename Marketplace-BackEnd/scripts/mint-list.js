const { deployments, ethers } = require("hardhat");

async function mintAndList() {
  const basicNft = await ethers.getContract("BasicNft");
  const nftMarketplace = await ethers.getContract("NftMarketPlace");

  console.log("Minting....");
  const tx = await basicNft.mintNft();
  const txResponse = await tx.wait(1);
  const tokenId = txResponse.events[1].args.tokenId;
  console.log(`Minted and Token ID of NFT is ${tokenId}.`);

  console.log("Approving....");
  const transaction = await basicNft.approve(nftMarketplace.address, tokenId);
  const transactionReceipt = await transaction.wait(1);

  console.log("Listing....");
  const PRICE = ethers.utils.parseEther("0.01");
  const listingTx = await nftMarketplace.listItem(
    basicNft.address,
    tokenId,
    PRICE
  );
  const listingTxReceipt = await listingTx.wait(1);
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
