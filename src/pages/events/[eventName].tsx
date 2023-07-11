import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import Moment from "react-moment";
import { useRecoilState } from "recoil";
import { HeartIcon, TicketIcon } from "@heroicons/react/outline";

import CreatedEvent from "../../../abis/Event.json";
import Navbar from "../../components/Navbar";
import {
  modalState,
  eventNameState,
  eventPage,
} from "../../../atoms/modalAtom";
import Modal from "../../components/Modal";
import { useWeb3 } from "../../hooks/useWeb3";
import { trpc } from "../../utils/trpc";
import eth from "../../../public/eth.png";

export default function EventDetails() {
  const [event, setEvent] = useState(null);
  const [openModal, setOpenModal] = useRecoilState(modalState);
  const [event_Name, setEventName] = useRecoilState(eventNameState);
  const [isEventPage, setEventPage] = useRecoilState(eventPage);
  // const [liked, setLiked] = useState(false);

  const router = useRouter();
  const { eventName } = router.query;
  console.log(eventName, "event name");

  const { data, isLoading, isError } = trpc.event.get.useQuery(
    eventName as string
  );

  const { account, web3 } = useWeb3();

  // useEffect(() => {
  //   if (event?.likes && event?.likes?.length > 0) {
  //     setLiked(
  //       event?.likes.findIndex(
  //         (l) => l.account.toLowerCase() === account?.toLowerCase()
  //       ) !== -1
  //     );
  //   }
  // }, [event?.likes, account]);

  // const mint = async (address, value, id) => {
  //   const eventContract = await new web3.eth.Contract(
  //     CreatedEvent.abi,
  //     address
  //   );
  //   console.log(eventContract);
  //   await eventContract.methods
  //     .mint(1, id)
  //     .send({ from: account, value })
  //     .on("confirmation", async () => {
  //       const balanceOf = await eventContract.methods
  //         .balanceOf(account, id)
  //         .call();
  //       console.log(balanceOf);
  //     })
  //     .on("error", (err) => {
  //       console.log(err);
  //     });
  // };

  // const findEvent = () => {
  //   data?.events.map((event) => {
  //     if (event.name === eventName) {
  //       setEvent(event);
  //     }
  //   });
  // };

  // const likePost = async () => {
  //   const body = {
  //     name: eventName,
  //     account: account,
  //   };

  //   if (eventPage) {
  //     if (
  //       event?.likes &&
  //       event?.likes?.length > 0 &&
  //       event?.likes.map((l) => l.account === account)
  //     ) {
  //       setLiked(false);
  //       await fetch("../api/remove-like", {
  //         method: "DELETE",
  //         body: JSON.stringify(body),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           console.log("Success:", data);
  //         });
  //     } else {
  //       setLiked(true);
  //       await fetch("../api/add-like", {
  //         method: "POST",
  //         body: JSON.stringify(body),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           console.log("Success:", data);
  //         });
  //     }
  //   } else {
  //     if (
  //       event?.likes &&
  //       event?.likes?.length > 0 &&
  //       event?.likes.map((l) => l.account === account)
  //     ) {
  //       setLiked(false);
  //       await fetch("api/remove-like", {
  //         method: "DELETE",
  //         body: JSON.stringify(body),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           console.log("Success:", data);
  //         });
  //     } else {
  //       setLiked(true);
  //       await fetch("api/add-like", {
  //         method: "POST",
  //         body: JSON.stringify(body),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           console.log("Success:", data);
  //         });
  //     }
  //   }
  // };

  // useEffect(() => {
  //   loadWeb3();
  //   loadBlockchainData();
  //   findEvent();
  // }, [account, eventName]);

  // if (error)
  //   return (
  //     <>
  //       <Navbar />
  //       <p>error</p>
  //     </>
  //   );
  // if (!data)
  //   return (
  //     <>
  //       <Navbar />
  // <div className="flex h-[350px] justify-center items-center">
  //   <div
  //     className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
  //     role="status"
  //   >
  //     <span className="visually-hidden">Loading...</span>
  //   </div>
  // </div>
  //     </>
  //   );

  return (
    <div>
      <Head>
        <title>{data?.event?.name}</title>
      </Head>
      <Navbar />
      {/* {openModal && <Modal account={account} />} */}
      {/* <div className="flex flex-col items-center sm:hidden">
      </div> */}

      {/* Desktop view */}

      <div className="sm:flex bg-slate-800 text-slate-200 justify-center p-2 w-full">
        <div className="space-y-2">
          {!isLoading ? (
            <Image
              alt=""
              height={500}
              width={500}
              className="max-h-[500px] w-full h-full mr-8 rounded-md border border-slate-700"
              src={`https://gateway.pinata.cloud/ipfs/${data?.event?.cid}`}
            />
          ) : (
            <div className="flex h-[350px] justify-center items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <p className="font-bold text-2xl">{data?.event?.name}</p>
            <p className="">
              <Moment fromNow>{data?.event?.createdAt}</Moment>
            </p>
          </div>
          <p className=" overflow-hidden text-ellipsis">
            Host: {data?.event?.createdBy}
          </p>
          <div className="border border-slate-500 rounded-md w-full max-w-[500px]">
            <h1 className="font-bold border-b border-b-slate-500 p-2">
              Description
            </h1>
            <p className="p-4">{data?.event?.description}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            {/* <HeartIcon
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
            </p> */}
          </div>
          <div className="border border-slate-500 rounded-md">
            <h1 className="p-2 border-b border-slate-500 font-bold">
              Ticket information
            </h1>
            <div className="p-6 flex items-center justify-around">
              <div className="flex items-center">
                <p className="mr-2">{data?.event?.amountOfTickets}</p>
                <TicketIcon className="h-5 text-slate-400" />
              </div>
              <div className="flex items-center">
                <p>{data?.event?.price}</p>
                <Image alt="" src={eth} height={20} width={20} />
              </div>
            </div>
            <div className="flex justify-center">
              <button // TODO: Add data.event.address guard
                // onClick={() => mint(event.address, event.costPerTicket, 0)}
                className="bg-[#ff9531] w-full rounded-t-none text-white border border-[#ff9531] font-normal rounded py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
              >
                Mint
              </button>
            </div>
          </div>
          <div className="border border-slate-600 rounded-md">
            <div className="flex justify-between p-2 border-slate-600 border-b">
              <div className="flex">
                <h1 className="font-bold mr-2">Comments </h1>
                <p className="text-gray-500">
                  {/* {data.events.map((event) => {
                    if (event.name === eventName) {
                      return event.comments?.length;
                    }
                  })} */}
                </p>
              </div>

              <p
                onClick={() => {
                  // setEventName(eventName);
                  setEventPage(true);
                  setOpenModal(true);
                }}
                className="text-gray-400 cursor-pointer"
              >
                Add a comment
              </p>
            </div>
            <div className="p-4 space-y-2 flex flex-col items-center">
              {/* {data.events.map((event) => {
                if (event.name === eventName) {
                  return event.comments?.map((comment) => (
                    <div className="space-y-2 w-full">
                      <p className="text-gray-400 text-sm">
                        {comment.account ? comment.account : "Annonymous User"}
                      </p>
                      <p className="border-b text-gray-700">
                        {comment.comment}
                      </p>
                    </div>
                  ));
                }
              })} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
