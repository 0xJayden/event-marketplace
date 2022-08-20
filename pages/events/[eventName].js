import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import Head from "next/head";
import Web3 from "web3";
import FeedItem from "../../components/Feed-Item";
import CreatedEvent from "../../abis/Event.json";
import getEventData from "../../components/get-event-data";
import Navbar from "../../components/Navbar";
import { modalState, eventNameState, eventPage } from "../../atoms/modalAtom";
import Moment from "react-moment";
import { HeartIcon, TicketIcon } from "@heroicons/react/outline";
import Modal from "../../components/Modal";

export default function EventDetails() {
  const [web3, setWeb3] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [isError, setIsError] = useState(null);
  const [event, setEvent] = useState(null);
  const [openModal, setOpenModal] = useRecoilState(modalState);
  const [event_Name, setEventName] = useRecoilState(eventNameState);
  const [isEventPage, setEventPage] = useRecoilState(eventPage);
  const [liked, setLiked] = useState(false);

  const router = useRouter();
  const { eventName } = router.query;

  useEffect(() => {
    if (event?.likes && event?.likes?.length > 0) {
      setLiked(
        event?.likes.findIndex(
          (l) => l.account.toLowerCase() === account?.toLowerCase()
        ) !== -1
      );
    }
  }, [event?.likes, account]);

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
    data?.events.map((event) => {
      if (event.name === eventName) {
        setEvent(event);
      }
    });
  };

  const likePost = async () => {
    const body = {
      name: eventName,
      account: account,
    };

    if (eventPage) {
      if (
        event?.likes &&
        event?.likes?.length > 0 &&
        event?.likes.map((l) => l.account === account)
      ) {
        setLiked(false);
        await fetch("../api/remove-like", {
          method: "DELETE",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Success:", data);
          });
      } else {
        setLiked(true);
        await fetch("../api/add-like", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Success:", data);
          });
      }
    } else {
      if (
        event?.likes &&
        event?.likes?.length > 0 &&
        event?.likes.map((l) => l.account === user)
      ) {
        setLiked(false);
        await fetch("api/remove-like", {
          method: "DELETE",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Success:", data);
          });
      } else {
        setLiked(true);
        await fetch("api/add-like", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Success:", data);
          });
      }
    }
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
      {openModal && <Modal account={account} />}
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

      {/* Desktop view */}

      <div className="sm:flex justify-center pt-8 w-full hidden">
        <div className="space-y-8">
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
          <div className="flex items-center">
            <p className="font-bold text-2xl mr-2">{event?.name}</p>
            <HeartIcon
              onClick={likePost}
              className={`h-5 mr-1 cursor-pointer ${
                liked ? "text-red-500" : "text-gray-500"
              }`}
            />
            <p>
              {data?.events.map((event) => {
                if (event.name === eventName) {
                  return event.likes?.length;
                }
              })}
            </p>
          </div>

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
          <div className="border rounded-md">
            <div className="flex justify-between p-2 border-b">
              <div className="flex">
                <h1 className="font-bold mr-2">Comments </h1>
                <p className="text-gray-500">
                  {data.events.map((event) => {
                    if (event.name === eventName) {
                      return event.comments?.length;
                    }
                  })}
                </p>
              </div>

              <p
                onClick={() => {
                  setEventName(eventName);
                  setEventPage(true);
                  setOpenModal(true);
                }}
                className="text-gray-400 cursor-pointer"
              >
                Add a comment
              </p>
            </div>
            <div className="p-4 space-y-2 flex flex-col items-center">
              {data.events.map((event) => {
                if (event.name === eventName) {
                  return event.comments?.map((comment) => (
                    <div className="space-y-2 w-full">
                      <p className="text-gray-400 text-sm">
                        {comment.account ? comment.account : "Annonymous User"}
                      </p>
                      <p className="border-b">{comment.comment}</p>
                    </div>
                  ));
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
