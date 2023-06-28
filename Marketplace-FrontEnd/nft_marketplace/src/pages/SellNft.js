import { Button, Form } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../../constants/BasicNft.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";
import networkMapping from "../../constants/networkMapping.json";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import { useEffect, useState } from "react";

export default function SellNft() {
  const dispatch = useNotification();
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const [proceeds, setProceeds] = useState("0");
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
  const { runContractFunction } = useWeb3Contract();
  async function approveAndList(data) {
    console.log("Approving....");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, "ether")
      .toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess() {
    // await tx.wait(1);
    dispatch({
      type: "success",
      message: "NFT listing!!!!",
      title: "NFT Listed!",
      position: "topR",
    });
  }

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      title: "Withdrawing....",
      message: "Withdrawing Proceeds....Please wait",
      position: "topR",
    });
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });

    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    setupUI();
  }, [proceeds, account, isWeb3Enabled, chainId]);

  return (
    <div className="w-3/4 m-auto p-20">
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price(In ETH)",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
        title="Sell Your NFT !"
        id="Main Form"
        className="p-12"
      />
      <div className="font-semibold text-lg pl-2 pt-10">
        Your Proceeds : {ethers.utils.formatEther(proceeds)}
      </div>
      <div className="m-1">
        {proceeds != "0" ? (
          <Button
            onClick={() => {
              runContractFunction({
                params: {
                  abi: nftMarketplaceAbi,
                  contractAddress: marketplaceAddress,
                  functionName: "withdrawProceeds",
                  params: {},
                },
                onError: (error) => console.log(error),
                onSuccess: () => handleWithdrawSuccess(),
              });
            }}
            text=" Withdraw"
            type="button"
          />
        ) : (
          <div className="m-2">
            Sorry ! You don't have any Proceeds to Withdraw :({" "}
          </div>
        )}
      </div>
    </div>
  );
}
