import { useState, useEffect } from "react";
import Head from "next/head";
import EventMarketplace from "../components/eventMarketplace";
import Web3 from "web3";
import Navbar from "../components/Navbar";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null);
  const [account, setAccount] = useState("");
  const [isError, setIsError] = useState(false);

  //Load web3 and metamask account, handle account and chain changes.
  const loadWeb3 = async () => {
    if (typeof window.ethereum !== "undefined" && !account) {
      const web3: Web3 = new Web3(window.ethereum);
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        console.log("please install metamask");
      }

      window.ethereum.on("accountsChanged", (accounts: Array<string>) => {
        setAccount(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId: number) => {
        window.location.reload();
      });

      const networkId = await web3.eth.net.getId();
      setCurrentNetwork(networkId);
    } else {
      console.log("error");
    }
  };

  // to connect wallet/account with button
  const web3Handler = async () => {
    if (web3) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      console.log("Please install MetaMask.");
    }
  };

  useEffect(() => {
    loadWeb3();
  }, [account]);

  return (
    <main className="flex flex-col items-center">
      <Head>
        <title>Social.io</title>
      </Head>
      <Navbar account={account} web3Handler={web3Handler} />
      <EventMarketplace />
    </main>
  );
}

export default App;
