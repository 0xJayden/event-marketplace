import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
import Moment from "react-moment";
import { useRecoilState } from "recoil";
import {
  ArrowRightIcon,
  HeartIcon,
  TicketIcon,
  UserCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import { Cairo } from "next/font/google";

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

const cairo = Cairo({ subsets: ["latin"] });

export default function EventDetails() {
  const [event, setEvent] = useState(null);
  // const [openModal, setOpenModal] = useRecoilState(modalState);
  const [event_Name, setEventName] = useRecoilState(eventNameState);
  // const [isEventPage, setEventPage] = useRecoilState(eventPage);
  const [liked, setLiked] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");

  const router = useRouter();
  const { eventName } = router.query;
  console.log(eventName, "event name");

  const {
    data: eventData,
    isLoading,
    isError,
    refetch: refetchEvent,
  } = trpc.event.get.useQuery(eventName as string);

  const likeMutation = trpc.event.likeEvent.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const { data: userWithLikes, refetch } = trpc.user.getUserWithLikes.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        console.log(data);
        const userLiked = data?.userWithLikes?.likes.find(
          (like) => like.eventId === eventData?.event?.id
        );
        if (userLiked) {
          setLiked(true);
        } else {
          setLiked(false);
        }
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const commentMutation = trpc.event.comment.useMutation({
    onSuccess: (data) => {
      console.log(data);
      if (refetchEvent) refetchEvent();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const addComment = (e: FormEvent) => {
    e.preventDefault();
    if (!eventData?.event) return console.log("no event");
    commentMutation.mutate({ eventId: eventData?.event?.id, comment });
    setComment("");
  };

  const { account, web3 } = useWeb3();

  const likeEvent = () => {
    if (!eventData?.event) return console.log("no event");

    likeMutation.mutate({ eventId: eventData.event.id });
  };

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
    <div style={cairo.style}>
      <Head>
        <title>{eventData?.event?.name}</title>
      </Head>
      <Navbar />
      {/* {openModal && <Modal />} */}
      {/* <div className="flex flex-col items-center sm:hidden">
      </div> */}

      {/* Desktop view */}

      <div className="sm:flex min-h-screen bg-slate-800 text-slate-200 justify-center p-2 w-full">
        <div className="space-y-2">
          {!isLoading ? (
            <Image
              alt=""
              height={500}
              width={500}
              className="max-h-[500px] w-full h-full mr-8 rounded-md border border-slate-700"
              src={`https://gateway.pinata.cloud/ipfs/${eventData?.event?.cid}`}
            />
          ) : (
            <div className="flex h-[350px] justify-center items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500"
                role="status"
              >
                {/* <span className="visually-hidden">Loading...</span> */}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <p className="font-bold text-2xl">{eventData?.event?.name}</p>
            <p className="">
              <Moment fromNow>{eventData?.event?.createdAt}</Moment>
            </p>
          </div>
          <p className=" overflow-hidden text-ellipsis">
            Host: {eventData?.event?.createdBy}
          </p>
          <div className="flex items-center">
            <HeartIcon
              onClick={() => likeEvent()}
              className={`h-7 mr-1 cursor-pointer ${
                liked ? "text-red-500" : "text-gray-500"
              }`}
            />
            <p>{eventData?.event?.likes ? eventData.event.likes.length : 0}</p>
          </div>
          <div className="border border-slate-600 rounded-md w-full max-w-[500px]">
            <h1 className="font-bold border-b border-b-slate-600 p-2">
              Description
            </h1>
            <p className="p-4">{eventData?.event?.description}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-slate-600 rounded-md">
            <h1 className="p-2 border-b border-slate-600 font-bold">
              Ticket information
            </h1>
            <div className="p-6 flex items-center justify-around">
              <div className="flex items-center">
                <p className="mr-2">{eventData?.event?.amountOfTickets}</p>
                <TicketIcon className="h-5 text-slate-400" />
              </div>
              <div className="flex items-center">
                <p>${eventData?.event?.price.toFixed(2)}</p>
                {/* <Image alt="" src={eth} height={20} width={20} /> */}
              </div>
            </div>
            <div className="flex justify-center">
              <button // TODO: Add data.event.address guard
                // onClick={() => mint(event.address, event.costPerTicket, 0)}
                className="bg-[#ff9531] w-full rounded-t-none text-white border border-[#ff9531] font-normal rounded py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
              >
                Buy
              </button>
            </div>
          </div>
          <div className="border border-slate-600 rounded-md">
            <div className="flex justify-between p-2 border-slate-600 border-b">
              <div className="flex">
                <h1 className="font-bold mr-2">Comments </h1>
                <p className="text-slate-400">
                  {eventData?.event?.comments?.length}
                </p>
              </div>

              <p
                onClick={() => {
                  setOpenComments(true);
                  // setEventName(eventName);
                  // setEventPage(true);
                  // setOpenModal(true);
                }}
                className="text-gray-400 cursor-pointer"
              >
                Add a comment
              </p>
            </div>
            <div className="max-h-[300px] overflow-y-scroll space-y-2 flex flex-col items-center">
              {eventData?.event &&
                eventData.event.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="w-full items-center justify-between p-2 flex space-y-2 py-2 border-b-slate-600 border-b"
                  >
                    <div className="flex space-x-2">
                      {comment.pfp ? (
                        <Image
                          src={comment.pfp}
                          alt=""
                          width={50}
                          height={50}
                          className="rounded-full max-h-[50px]"
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-slate-400" />
                      )}
                      <div>
                        <p className="text-slate-400">{comment.author}</p>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                    <Moment className="text-slate-400 text-sm" fromNow>
                      {comment.createdAt}
                    </Moment>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {openComments && (
        <div className="fixed top-0 left-0 w-full h-full text-white bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-slate-800 flex flex-col relative w-[90%] sm:w-[50%] h-[80%] sm:h-[50%] rounded-lg shadow-lg overflow-y-scroll">
            <XIcon
              onClick={() => setOpenComments(false)}
              className="h-6 self-start m-2"
            />
            {eventData?.event?.comments?.length &&
            eventData.event.comments.length > 0 ? (
              eventData.event.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="overflow-hidden items-center justify-between p-2 flex space-y-2 py-2 text-ellipsis border-b-slate-600 border-b"
                >
                  <div className="flex space-x-2">
                    {comment.pfp ? (
                      <Image
                        src={comment.pfp}
                        alt=""
                        width={50}
                        height={50}
                        className="rounded-full max-h-[50px]"
                      />
                    ) : (
                      <UserCircleIcon className="h-10 w-10 text-slate-400" />
                    )}
                    <div>
                      <p className="text-slate-400">{comment.author}</p>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                  <Moment className="text-slate-400 text-sm" fromNow>
                    {comment.createdAt}
                  </Moment>
                </div>
              ))
            ) : (
              <p className="p-2">No comments yet</p>
            )}
            <form onSubmit={addComment}>
              <input
                className="bg-transparent absolute w-full outline-none bottom-0 border border-slate-700 rounded-lg text-white p-2"
                placeholder="Add comment"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              />
              <button
                className="absolute bottom-0 right-0 text-slate-400 font-bold rounded-lg p-2"
                type="submit"
              >
                <ArrowRightIcon className="h-6" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
