import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import Head from "next/head";
import Web3 from "web3";
import FeedItem from "../../components/Feed-Item";
import CreatedEvent from "../../abis/Event.json";
import getEventData from "../../components/get-event-data";
import Navbar from "../../components/Navbar";
import { modalState } from "../../atoms/modalAtom";
import Moment from "react-moment";
import { TicketIcon } from "@heroicons/react/outline";

export default function EventDetails() {
  const [web3, setWeb3] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [isError, setIsError] = useState(null);
  const [event, setEvent] = useState(null);
  const [openModal, setOpenModal] = useRecoilState(modalState);

  const router = useRouter();
  const { eventName } = router.query;

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

  const mint = async (address, value, id) => {
    const eventContract = await new web3.eth.Contract(
      CreatedEvent.abi,
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
      .on("error", (err) => {
        console.log(err);
      });
  };

  const findEvent = () => {
    data.events.map((event) => {
      if (event.name === eventName) {
        setEvent(event);
      }
    });
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
    findEvent();
  }, [account, eventName]);

  const { data, error } = getEventData();

  if (error)
    return (
      <>
        <Navbar account={account} web3Handler={web3Handler} />
        <p>error</p>
      </>
    );
  if (!data)
    return (
      <>
        <Navbar account={account} web3Handler={web3Handler} />
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
    <div>
      <Head>
        <title>{event?.name}</title>
      </Head>
      <Navbar data={data} account={account} web3Handler={web3Handler} />
      <div className="flex flex-col items-center sm:hidden">
        <FeedItem
          key={event?.name}
          mint={mint}
          time={event?.time}
          address={event?.address}
          account={event?.account}
          name={event?.name}
          symbol={event?.symbol}
          image={event?.image}
          amountOfTickets={event?.amountOfTickets}
          costPerTicket={event?.costPerTicket}
          description={event?.description}
          likes={event?.likes}
          comments={event?.comments}
          eventPage
        />
      </div>
      <div className="sm:flex justify-center pt-8 w-full hidden">
        <div className="space-y-4">
          <img
            className="max-h-[500px] mr-8 rounded-md border"
            src={event?.image}
          />
          <div className="border rounded-md max-w-[500px]">
            <h1 className="font-bold border-b p-2">Description</h1>
            <p className="p-4">{event?.description}</p>
          </div>
        </div>
        <div className="m-4 space-y-4">
          <p className="font-bold text-2xl">{event?.name}</p>
          <p>Host: {event?.account}</p>
          <p className="text-gray-400">
            <Moment fromNow>{event?.time}</Moment>
          </p>
          <div className="border rounded-md">
            <h1 className="p-2 border-b font-bold">Ticket information</h1>
            <div className="p-6 flex items-center justify-around">
              <div className="flex items-center">
                <p className="mr-2">{event?.amountOfTickets}</p>
                <TicketIcon className="h-5 text-yellow-500" />
              </div>
              <div>
                <p>{event?.costPerTicket} ETH/ticket</p>
              </div>
            </div>
            <div className="flex justify-center">
              {event?.address ? (
                <button
                  onClick={() => mint(event.address, event.costPerTicket, 0)}
                  className="bg-green-500 w-full rounded-t-none text-white border border-green-500 font-normal rounded-md py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
                >
                  Mint
                </button>
              ) : (
                <button className="border-green-500 w-full rounded-t-none text-green-500 border-2 rounded-md p-1 px-2 max-h-[42px]">
                  Loading...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
