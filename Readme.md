# Decentralized NFT Marketplace

A fully decentralized end-to-end NFT Marketplace where users can list and buy NFTs using Ethereum. The project utilizes Hardhat for deployment and testing of smart contracts written in Solidity. It also incorporates The Graph protocol for event indexing and utilizes GraphQL to access data.

## Features

- List NFTs: Users can list their NFTs in the marketplace.
- Buy NFTs: Users can purchase NFTs listed in the marketplace by paying with ETH.
- Update NFTs: Owners can update the price of their NFTs.

## Technologies Used

- Backend:

  - Hardhat: Development environment for Ethereum smart contracts.
  - Solidity: Programming language for writing smart contracts.
  - The Graph: Event indexer to detect contract events.
  - GraphQL: Query language for accessing data from The Graph.

- Frontend:
  - Next.js: React framework for building user interfaces.
  - Apollo Client: State management and GraphQL integration.
  - Moralis Hooks: Library for interacting with Ethereum and Moralis backend.
  - Web3UIKit: UI components for Ethereum-based applications.

## Installation

    git clone https://github.com/Nilesh-Nath/Full-Stack-NFTMarketplace.git

## Usage

1. Connect to an Ethereum network using a compatible wallet (e.g., MetaMask).
2. Browse the NFT marketplace to view listed NFTs.
3. To list an NFT:

- Provide the necessary details, including the NFT address, token ID and price in Sell NFT section.

4. To buy an NFT:

- Click on the desired NFT and proceed with the purchase by paying the listed price in ETH.

5. To update the price of your listed NFT:

- Access your account and locate the listed NFT.
- Update the price to a new value.
