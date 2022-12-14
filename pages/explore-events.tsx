import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import Web3 from "web3";
import CreatedEvent from "../abis/Event.json";
import FeedItem from "../components/Feed-Item";
import getEventData from "../components/get-event-data";
import Navbar from "../components/Navbar";
import { AbiItem } from "web3-utils";
import { modalState } from "../atoms/modalAtom";
import Modal from "../components/Modal";

interface Event {
  name: string;
  time: Date;
  address: string;
  account: string;
  user: string;
  image: string;
  amountOfTickets: number;
  costPerTicket: number;
  description: string;
  likes?: Array<{ account: string }>;
  comments?: Array<{ account: string; comment: string }>;
}

export default function ExploreEvents() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null);
  const [account, setAccount] = useState("");
  const [isError, setIsError] = useState(false);
  const [openModal, setOpenModal] = useRecoilState(modalState);

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

  const mint = async (address: string, value: number, id: number) => {
    if (web3) {
      const eventContract = new web3.eth.Contract(
        CreatedEvent.abi as AbiItem[],
        address
      );
      console.log(eventContract);
      await eventContract.methods
        .mint(1, id)
        .send({ from: account, value })
        .on("confirmation", async () => {
          const balanceOf = await eventContract.methods
            .balanceOf(account, id)
            .call();
          console.log(balanceOf);
        })
        .on("error", (err: Error) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, [account]);

  const { data, error } = getEventData();

  if (error)
    return (
      <>
        <Navbar data={data} account={account} web3Handler={web3Handler} />
        <p>error</p>
      </>
    );
  if (!data)
    return (
      <>
        <Navbar data={data} account={account} web3Handler={web3Handler} />
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
    <>
      <Navbar data={data} account={account} web3Handler={web3Handler} />
      {openModal && <Modal account={account} />}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-[1000px] pt-4 pl-12 sm:pl-4">
          <h1 className="text-2xl font-bold">All events</h1>
        </div>
        <div className="flex flex-col items-center gap-3 my-4 sm:grid-cols-4 sm:grid sm:max-w-[1000px]">
          {data.events.map((event: Event) => (
            <FeedItem
              key={event?.name}
              mint={mint}
              time={event?.time}
              address={event?.address}
              account={event?.account}
              user={account}
              name={event?.name}
              image={event?.image}
              amountOfTickets={event?.amountOfTickets}
              costPerTicket={event?.costPerTicket}
              description={event?.description}
              likes={event?.likes}
              comments={event?.comments}
            />
          ))}
        </div>
      </div>
    </>
  );
}
