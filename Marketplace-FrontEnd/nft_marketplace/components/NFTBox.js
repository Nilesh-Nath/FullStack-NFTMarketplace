import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import Image from "next/image";
import { Card, NFTCard, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "../components/UpdateListingModal.js";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "....";
  const separatorLength = separator.length;
  const charsToShow = strLen - separatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const dispatch = useNotification();
  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "getTokenURI",
    params: {},
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    const tokenURI = await getTokenURI();
    console.log(`The Image URI is ${tokenURI}....`);
    if (tokenURI) {
      // Since not all the browsers are IPFS compatible so we convert the ipfs edition to http edition

      try {
        const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log(requestURL);
        const tokenURIResponse = await (await fetch(requestURL)).json();
        console.log(tokenURIResponse);
        const imageURI = tokenURIResponse.image;
        console.log(imageURI);
        const imageURIURL = imageURI.replace(
          "ipfs://",
          "https://ipfs.io/ipfs/"
        );
        setImageURI(imageURIURL);
        setTokenName(tokenURIResponse.name);
        setTokenDescription(tokenURIResponse.description);
        console.log(imageURI);
      } catch (e) {
        console.log(e);
      }
      // Process the response data here
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = () => {
    console.log("I'm Clicked!");
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.log(error),
          onSuccess: handleBuySuccess(),
        });
    console.log(showModal);
  };

  const handleBuySuccess = () => {
    dispatch({
      type: "success",
      message: "Item Bought!",
      title: "Item Bought!!",
      position: "topR",
    });
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <div>
        {imageURI ? (
          <div className="p-20">
            <UpdateListingModal
              isVisible={showModal}
              nftAddress={nftAddress}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              onClose={hideModal}
            />
            <Card
              title={tokenName}
              // description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">
                    Owned by {formattedSellerAddress}
                  </div>

                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                  />
                  <div className="font-bold">
                    {ethers.utils.formatEther(price)}ETH
                  </div>
                  <div>NFT Address : {truncateStr(nftAddress, 12)}</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading....</div>
        )}
      </div>
    </div>
  );
}
