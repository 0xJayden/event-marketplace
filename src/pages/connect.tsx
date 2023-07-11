import { useEffect } from "react";
import { useState } from "react";
import Web3 from "web3";
// import GetEventData from "../components/get-event-data";
import Navbar from "../components/Navbar";

export default function Connect() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");

  // const { data, error } = GetEventData();

  const loadWeb3 = async () => {
    if (typeof window.ethereum !== "undefined" && !account) {
      const web3 = new Web3(window.ethereum);
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
    <div className="flex flex-col items-center">
      {/* <Navbar web3Handler={web3Handler} account={account} data={data} /> */}
      <div className="mt-16 px-4 space-y-4">
        <h1 className="font-bold text-xl">Connect your MetaMask wallet.</h1>
        <p>
          If you don't have MetaMask, you can install it{" "}
          <a
            className="cursor-pointer font-bold text-blue-500"
            href="https://metamask.io"
          >
            here.
          </a>
        </p>
        {!account ? (
          <button
            onClick={web3Handler}
            className="bg-blue-500 border-2 border-blue-500 text-white p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out"
          >
            Connect
          </button>
        ) : (
          <button className="bg-blue-500 border-2 border-blue-500 text-white p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out">
            Connected
          </button>
        )}
      </div>
    </div>
  );
}
