import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
  isVisible,
  nftAddress,
  tokenId,
  marketplaceAddress,
  onClose,
}) {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateNft",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  });
  const dispatch = useNotification();

  const hanndleListingSuccess = async () => {
    dispatch({
      type: "success",
      message: "Listing Updated !",
      title:
        "Listing Updated - Please Refresh and Wait for the Tx to compleate !",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
  };

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => {
            console.log(error);
          },
          onSuccess: () => hanndleListingSuccess(),
        });
      }}
    >
      <div className="m-2">
        <div className="font-bold ml-2 mb-4 text-lg">Update Price!</div>
        <div className="m-2">
          <Input
            label="Update listing price in L1 currency (ETH)"
            name="New Listing Price"
            type="number"
            onChange={(event) => {
              setPriceToUpdateListingWith(event.target.value);
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
