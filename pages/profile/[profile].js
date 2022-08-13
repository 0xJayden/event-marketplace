import getEventData from "../../components/get-event-data";
import Web3 from "web3";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import CreatedEvent from "../../abis/Event.json";

export default function profile() {
  const { data, error } = getEventData();
  const [web3, setWeb3] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [isError, setIsError] = useState(null);
  const [balances, setBalances] = useState([]);
  const [pfp, setPfp] = useState(null);
  const [isPfpSelected, setIsPfpSelected] = useState(false);

  const imageInputRef = useRef();

  const router = useRouter();

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

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    } else {
      console.log("error");
    }
  };

  const loadBlockchainData = async () => {
    if (web3) {
      const networkId = await web3.eth.net.getId();
      setCurrentNetwork(networkId);
    } else {
      setIsError(true);
      console.log(
        "Contract not deployed to current network, please change network in MetaMask"
      );
    }
  };

  const loadBalances = () => {
    let newBalances = [];

    data?.events.map(async (e) => {
      let newEvent = new web3.eth.Contract(CreatedEvent.abi, e.address);

      let balance = await newEvent.methods.balanceOf(account, 0).call();
      if (balance > 0) {
        newBalances.push(e);
        setBalances(newBalances);
      }
    });
  };

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

  const setProfilePicture = (e) => {
    const image = e.target.files[0];
    // setImage(image);
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", (e) => {
      setPfp(e.target.result);
      setIsPfpSelected(true);
    });
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, [account]);

  useEffect(() => {
    loadBalances();
  }, [data]);

  if (error) return "error";
  if (!data) return "loading...";

  return (
    <div className="relative">
      <Navbar account={account} web3Handler={web3Handler} />
      <div className={`h-[100px] w-full bg-gray-100 cursor-pointer `}></div>
      <div
        onClick={() => imageInputRef.current.click()}
        className="absolute shadow-md bg-white top-[120px] ml-4 h-[90px] w-[90px] rounded-full border cursor-pointer"
      >
        <input
          className="text-xs ml-8 w-1/2"
          required
          type="file"
          name="photo"
          id="photo"
          onChange={setProfilePicture}
          ref={imageInputRef}
          hidden
        ></input>
        {isPfpSelected && <img src={pfp} />}
      </div>
      <div className="mt-20 ml-4 max-w-[200px]">
        <p className="text-xl font-bold overflow-hidden text-ellipsis hover:underline cursor-pointer">
          {account}
        </p>
      </div>
      <div className="mx-4 mt-10 border-b">
        <p className="font-semibold underline underline-offset-4">Tickets</p>
      </div>
      {balances.map((e) => (
        <div className="grid grid-cols-2 p-4 max-w-[400px]">
          <div className="shadow-md rounded">
            <div className="p-2">{e.name}</div>
            <img src={e.image} />
          </div>
        </div>
      ))}
    </div>
  );
}
