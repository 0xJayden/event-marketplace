// import { MongoClient, ObjectId } from "mongodb";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import Head from "next/head";
import Web3 from "web3";
import FeedItem from "../../components/Feed-Item";
import CreatedEvent from "../../abis/Event.json";
import getEventData from "../../components/get-event-data";
import Modal from "../../components/Modal";
import Navbar from "../../components/Navbar";
import { modalState } from "../../atoms/modalAtom";

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
  }, [account, data, eventName]);

  const { data, error } = getEventData();

  if (error) return "error";
  if (!data) return "loading...";

  return (
    <div>
      <Head>
        <title>{event?.name}</title>
      </Head>
      {openModal && <Modal account={account} />}
      <Navbar
        account={account}
        // setOpenCreateEvent={setOpenCreateEvent}
        web3Handler={web3Handler}
        // setOpenHome={setOpenHome}
        // setOpenExplore={setOpenExplore}
      />
      <div className="flex flex-col items-center sm:grid-cols-4 sm:grid">
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
    </div>
  );
}
