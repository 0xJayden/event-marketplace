import { useEffect, useState } from "react";
import Web3 from "web3";

export const useWeb3 = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number>();

  //Load web3 and metamask account, handle account and chain changes.
  const loadWeb3 = async () => {
    if (window.ethereum !== null) {
      const web3: Web3 = new Web3(window.ethereum);
      setWeb3(web3);

      console.log(web3, "web3");
      const accounts = await web3.eth.getAccounts().catch((err) => {
        console.log(err);
        return;
      });

      if (accounts && accounts.length > 0) {
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

  const loadBlockchainData = async () => {
    if (web3 && account) {
      const networkId = await web3.eth.net.getId();
      setCurrentNetwork(networkId);
    } else {
      console.log(
        "Contract not deployed to current network, please change network in MetaMask"
      );
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
    loadBlockchainData();
  }, [account]);

  return { web3, account, web3Handler, currentNetwork, chainId };
};
