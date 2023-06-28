import "@/styles/globals.css";
import { NotificationProvider } from "web3uikit";
import Head from "next/head";
import { MoralisProvider } from "react-moralis";
import Header from "../../components/Header";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/48746/nftmarketplace/v0.0.7",
  // https://api.studio.thegraph.com/query/48746/nftmarketplace/version/latest
});

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Nft Marketplace</title>
        <meta name="description" content="NFT Marketplace to sell your NFTs" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header />
            <Component {...pageProps} />
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}
