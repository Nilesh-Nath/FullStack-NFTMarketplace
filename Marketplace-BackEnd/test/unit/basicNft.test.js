const { assert, expect } = require("chai");
const { network, ethers, deployments } = require("hardhat");

const chainId = network.config.chainId;

chainId == 31337
  ? describe("Basic NFT", () => {
      let basicNft, deployer;
      const TOKEN_ID = 0;
      const tokenUri = "ipfs://QmXaJn2EceyjinvthPhqbDnXTFM82Djh7i3zqoAPud7Zxi";
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["basicNft"]);
        basicNft = await ethers.getContract("BasicNft", deployer);
      });

      describe("1.Constructor", () => {
        it("It should Initialize the token to 0!", async () => {
          const initialToken = await basicNft.getTokenCounter();
          assert.equal(initialToken.toString(), "0");
        });
      });

      describe("2.Mint NFT", () => {
        it("It should increase the Token ID!", async () => {
          await basicNft.mintNft();
          const tokenID = await basicNft.getTokenCounter();
          assert.equal(tokenID.toString(), "1");
        });
        it("It should emit an event after the NFT is being Minted!", async () => {
          await expect(basicNft.mintNft()).to.emit(basicNft, "NftMinted");
        });
      });
    })
  : describe.skip;
