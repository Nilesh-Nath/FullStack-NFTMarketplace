//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Imports

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Errors
error NftMarketPlace__PriceBelowZero();
error NftMarketPlace__NotApprovedForMarketPlace();
error NftMarketPlace__NftAlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketPlace__NotOwner();
error NftMarketPlace__PaidLessThanPrice(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketPlace__ItemNotListed(address nftAddress, uint256 tokenId);
error NftMarketPlace__NoProceeds();
error NftMarketPlace__TransactionFailed();

contract NftMarketPlace is ReentrancyGuard {
    // Marketplace Variables

    struct listing {
        uint256 price;
        address seller;
    }

    // NftAddress --> tokenId --> listing
    mapping(address => mapping(uint256 => listing)) private s_listings;
    // Seller --> Balance
    mapping(address => uint256) private s_proceeds;

    // Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(address nftAddress, uint256 tokenId);

    ///////////////////////
    //     Modifiers     //
    ///////////////////////

    modifier notListed(address nftAddress, uint256 tokenId) {
        uint256 price = s_listings[nftAddress][tokenId].price;
        if (price > 0) {
            revert NftMarketPlace__NftAlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address seller
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (seller != owner) {
            revert NftMarketPlace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price <= 0) {
            revert NftMarketPlace__ItemNotListed(nftAddress, tokenId);
        }
        _;
    }

    ///////////////////////
    //   Main Functions  //
    ///////////////////////

    ////////////////
    /// @dev this function lists the nft provided the address,tokenId and price of the nft and checks if
    ///      the item if already listed and is the seller is the owner of the nft
    /// @param nftAddress is the address of the NFT that is being listed
    /// @param tokenId is the tokenId of the NFT that is being listed
    /// @param price is the Price of the NFT that is neing listed

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketPlace__PriceBelowZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketPlace__NotApprovedForMarketPlace();
        }

        s_listings[nftAddress][tokenId] = listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable nonReentrant isListed(nftAddress, tokenId) {
        listing memory listed_item = s_listings[nftAddress][tokenId];
        if (msg.value < listed_item.price) {
            revert NftMarketPlace__PaidLessThanPrice(
                nftAddress,
                tokenId,
                listed_item.price
            );
        }
        s_proceeds[listed_item.seller] =
            s_proceeds[listed_item.seller] +
            msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listed_item.seller,
            msg.sender,
            tokenId
        );

        emit ItemBought(msg.sender, nftAddress, tokenId, listed_item.price);
    }

    function updateNft(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isOwner(nftAddress, tokenId, msg.sender) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function cancelNft(
        address nftAddress,
        uint256 tokenId
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(nftAddress, tokenId);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketPlace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketPlace__TransactionFailed();
        }
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    function getListings(
        address nftAddress,
        uint256 tokenId
    ) public view returns (listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) public view returns (uint256) {
        return s_proceeds[seller];
    }
}
