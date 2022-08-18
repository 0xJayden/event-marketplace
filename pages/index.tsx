import { useState, useEffect } from "react";
import Head from "next/head";
import GetEventData from "../components/get-event-data";
import EventMarketplace from "../components/eventMarketplace";
import Web3 from "web3";
import Navbar from "../components/Navbar";

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number>();

  //Load web3 and metamask account, handle account and chain changes.
  const loadWeb3 = async () => {
    if (window.ethereum !== null) {
      const web3: Web3 = new Web3(window.ethereum);
      setWeb3(web3);
      console.log("web3");

      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        console.log(account);
      } else {
        return;
      }
      window.ethereum.on("accountsChanged", (accounts: Array<string>) => {
        setAccount(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId: number) => {
        window.location.reload();
      });

      const networkId = await web3.eth.net.getId();
      setCurrentNetwork(networkId);

      const chainId = await web3.eth.getChainId();
      setChainId(chainId);
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

  const { data, error } = GetEventData();

  if (error)
    return (
      <>
        <Navbar account={account} data={data} web3Handler={web3Handler} />
        <p>error</p>
      </>
    );
  if (!data)
    return (
      <>
        <Navbar account={account} data={data} web3Handler={web3Handler} />
        <div className="flex h-[350px] justify-center items-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );

  return (
    <main className="flex flex-col items-center">
      <Head>
        <title>Event Market Place</title>
      </Head>
      <Navbar account={account} web3Handler={web3Handler} data={data} />
      <EventMarketplace account={account} data={data} />
    </main>
  );
}

export default App;
