import GET_ACTIVE_ITEMS from "../../constants/subGraphQuery";
import { useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import NFTBox from "../../components/NFTBox";
import networkMapping from "../../constants/networkMapping.json";

export default function Body() {
  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);
  const { chainId, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl ml-20 mt-2">
        Recently Listed NFTs
      </h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          listedNfts?.activeItems.map((nft) => {
            const { price, nftAddress, seller, tokenId } = nft;
            return (
              <div key={tokenId}>
                <div>
                  <NFTBox
                    price={price}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    seller={seller}
                    key={`${nftAddress}${tokenId}`}
                  ></NFTBox>
                </div>
              </div>
            );
          })
        ) : (
          <div>Web3 Not Enabled</div>
        )}
      </div>
    </div>
  );
}
