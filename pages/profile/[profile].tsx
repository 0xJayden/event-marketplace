import getEventData from "../../components/get-event-data";
import Web3 from "web3";
import { useState, useEffect, useRef, BaseSyntheticEvent } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import CreatedEvent from "../../abis/Event.json";
import { AbiItem } from "web3-utils";

export default function profile() {
  const { data, error } = getEventData();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<number>();
  const [account, setAccount] = useState("");
  const [isError, setIsError] = useState(false);
  const [balances, setBalances] = useState<Array<{}>>();
  const [pfp, setPfp] = useState<string>();
  const [isPfpSelected, setIsPfpSelected] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

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
    let newBalances: Array<{}> = [];

    if (web3)
      data.events.map(async (e: any) => {
        let newEvent = new web3.eth.Contract(
          CreatedEvent.abi as AbiItem[],
          e.address
        );

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

  const setProfilePicture = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    // setImage(image);
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", (e) => {
      if (
        e.target == null ||
        e.target.result == null ||
        typeof e.target.result !== "string"
      )
        return;
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
        onClick={() => imageInputRef.current?.click()}
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
      <div className="grid gap-2 grid-cols-2 m-4 justify-center items-center">
        {balances?.map((e: any) => (
          <div
            key={e.name}
            className="flex flex-col justify-center shadow-md rounded w-full"
          >
            <div className="p-2">{e.name}</div>
            <img src={e.image} />
          </div>
        ))}
      </div>
    </div>
  );
}
