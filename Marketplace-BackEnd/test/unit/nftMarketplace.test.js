const { assert, expect } = require("chai");
const { network, ethers, deployments } = require("hardhat");
const chainId = network.config.chainId;

chainId == 31337
  ? describe("NftMarketPlace", () => {
      let nftMarketPlace, basicNft, deployer, player;
      const TOKEN_ID = 0;
      const PRICE = ethers.utils.parseEther("0.01");
      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(["all"]);
        const basicNftContract = await ethers.getContract("BasicNft");
        basicNft = basicNftContract.connect(deployer);
        const nftMarketplaceContract = await ethers.getContract(
          "NftMarketPlace"
        );
        nftMarketPlace = nftMarketplaceContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
      });

      describe("1.List Item", () => {
        it("It should revert if the price is set 0 or less than 0!", async () => {
          const ZERO_PRICE = ethers.utils.parseEther("0");
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, ZERO_PRICE)
          ).to.be.revertedWith("NftMarketPlace__PriceBelowZero");
        });

        it("It reverts the transaction if the NFT is not approved for Marketplace!", async () => {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NftMarketPlace__NotApprovedForMarketPlace");
        });

        it("Reverts if the NFT is already listed!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NftMarketPlace__NftAlreadyListed");
        });

        it("Checks if the Owner is uploading or not!", async () => {
          nftMarketPlace = nftMarketPlace.connect(player);
          basicNft.approve(basicNft.address, TOKEN_ID);
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NftMarketPlace__NotOwner");
        });

        it("It should upload the NFT in marketplace !", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const listings = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listings.price, PRICE);
          assert(listings.seller, deployer);
        });

        it("It should fire an Event after the NFT is being listed!", async () => {
          await expect(
            nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit(nftMarketPlace, "ItemListed");
        });
      });

      describe("2.Buy Item", async () => {
        it("Reverts if the paid value does not met the price of NFT!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const ZERO_PRICE = ethers.utils.parseEther("0");
          await expect(
            nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
              value: ZERO_PRICE,
            })
          ).to.be.revertedWith("NftMarketPlace__PaidLessThanPrice");
        });

        it("Reverts if the NFT is not listed !", async () => {
          await expect(
            nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
          ).to.be.revertedWith("NftMarketPlace__ItemNotListed");
        });

        it("Increase the Proceeds of the seller !", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(player);
          await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });

          const proceeds = await nftMarketPlace.getProceeds(deployer.address);
          assert.equal(proceeds.toString(), PRICE.toString());
        });

        it("It should remove the NFT from listings after it's Bought!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(player);
          await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          const listings = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );

          assert.equal(listings.price.toString(), "0");
        });

        it("It should transfer the NFT to new owner after it is bought!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(player);
          await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          assert.equal(newOwner.toString(), deployer.address);
        });

        it("It should emit an Event after the NFT is bought!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(player);
          await expect(
            nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
          ).to.emit(nftMarketPlace, "ItemBought");
        });
      });

      describe("3.Update NFT", () => {
        const NEW_PRICE = ethers.utils.parseEther("0.02");
        beforeEach(async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
        });
        it("It should check if the updater is Owner or not!", async () => {
          nftMarketPlace = nftMarketPlace.connect(player);
          await expect(
            nftMarketPlace.updateNft(basicNft.address, TOKEN_ID, NEW_PRICE)
          ).to.be.revertedWith("NftMarketPlace__NotOwner");
        });

        it("It should update the NFT !", async () => {
          await nftMarketPlace.updateNft(basicNft.address, TOKEN_ID, NEW_PRICE);
          const listing = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert.equal(listing.price.toString(), NEW_PRICE.toString());
        });

        it("It should emit an event after the NFT is updated!", async () => {
          await expect(
            nftMarketPlace.updateNft(basicNft.address, TOKEN_ID, NEW_PRICE)
          ).to.emit(nftMarketPlace, "ItemListed");
        });
      });

      describe("4.Cancel NFT", () => {
        it("It should check if the NFT is listed or not!", async () => {
          await expect(
            nftMarketPlace.cancelNft(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NftMarketPlace__ItemNotListed");
        });

        it("It should check if the canceler is owner of NFT or not !", async () => {
          nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketPlace = nftMarketPlace.connect(player);
          await expect(
            nftMarketPlace.cancelNft(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NftMarketPlace__NotOwner");
        });

        it("It should remove the NFT from listings!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.cancelNft(basicNft.address, TOKEN_ID);
          const lising = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert.equal(lising.price.toString(), "0");
        });

        it("It should emit an event after the NFT is canceled!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketPlace.cancelNft(basicNft.address, TOKEN_ID)
          ).to.emit(nftMarketPlace, "ItemCanceled");
        });
      });

      describe("5.Withdraw Proceeds", () => {
        it("It should check if the proceeds of the seller is 0 or not!", async () => {
          await expect(nftMarketPlace.withdrawProceeds()).to.be.revertedWith(
            "NftMarketPlace__NoProceeds"
          );
        });

        it("It should deduct the proceeds to 0 after withdrawl!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketPlace = nftMarketPlace.connect(player);
          await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          nftMarketPlace = nftMarketPlace.connect(deployer);
          await nftMarketPlace.withdrawProceeds();
          const remainingProceeds = await nftMarketPlace.getProceeds(
            deployer.address
          );
          assert.equal(remainingProceeds.toString(), "0");
        });

        it("It should add the proceeds to the seller!", async () => {
          await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketPlace = nftMarketPlace.connect(player);
          await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          nftMarketPlace = nftMarketPlace.connect(deployer);
          const deployerProceedsBefore = await nftMarketPlace.getProceeds(
            deployer.address
          );

          const deployerBalanceBefore = await deployer.getBalance();
          const txResponse = await nftMarketPlace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const deployerBalanceAfter = await deployer.getBalance();

          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString()
          );
        });
      });
    })
  : describe.skip;
