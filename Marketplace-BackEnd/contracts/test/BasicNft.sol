//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Imports
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    // Variables
    uint256 private s_tokenId;
    string private constant TOKEN_URI =
        "ipfs://QmXFtoWJ6L191EZznSY4FXxJSGu4WRuX3pLQFXbdWEBjvM";

    // Events
    event NftMinted(address indexed minter, uint256 indexed tokenId);

    constructor() ERC721("Basic NFT", "BNF") {
        s_tokenId = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenId);
        emit NftMinted(msg.sender, s_tokenId);
        s_tokenId = s_tokenId + 1;
    }

    function tokenURI(
        uint256 /* tokenId */
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    // Getters

    function getTokenCounter() public view returns (uint256) {
        return s_tokenId;
    }

    function getTokenURI() public pure returns (string memory) {
        return TOKEN_URI;
    }
}
