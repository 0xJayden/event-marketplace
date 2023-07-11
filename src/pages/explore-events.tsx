import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { AbiItem } from "web3-utils";
import Image from "next/image";
import Moment from "react-moment";
import { ChatIcon, HeartIcon, TicketIcon } from "@heroicons/react/outline";
import { Cairo } from "next/font/google";

import CreatedEvent from "../../abis/Event.json";
import Navbar from "../components/Navbar";
import { modalState, eventNameState } from "../../atoms/modalAtom";
import Modal from "../components/Modal";
import { useWeb3 } from "../hooks/useWeb3";
import { trpc } from "../utils/trpc";
import eth from "../../public/eth.png";
import { useRouter } from "next/router";
import { useWallet } from "../hooks/useWallet";
import { useSession } from "next-auth/react";

interface Event {
  name: string;
  id: string;
  cid: string;
  amountOfTickets: number;
  price: number;
  description: string;
  createdBy: string;
  createdAt: Date;
  likes?: Array<{ account: string }>;
  comments?: Array<{ account: string; comment: string }>;
}

const cairo = Cairo({ subsets: ["latin"] });

export default function ExploreEvents() {
  const [openModal, setOpenModal] = useRecoilState(modalState);

  const { data, isError, isLoading } = trpc.event.getAll.useQuery();

  if (isError)
    return (
      <>
        <Navbar />
        <p>error</p>
      </>
    );
  if (isLoading)
    return (
      <>
        <Navbar />
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
      <Navbar />
      {openModal && <Modal />}
      <div
        style={cairo.style}
        className="flex text-slate-200 bg-slate-800 min-h-screen flex-col items-center w-full"
      >
        <div className="w-full max-w-[1000px] pt-4 pl-2 sm:pl-4">
          <h1 className="text-3xl text-center font-bold">All events</h1>
        </div>
        <div className="flex flex-col items-center gap-3 my-4 sm:grid-cols-4 sm:grid sm:max-w-[1000px]">
          {data && data.events
            ? data.events.map((event: Event) => (
                <FeedItem
                  key={event?.name}
                  createdBy={event?.createdBy}
                  createdAt={event?.createdAt}
                  name={event?.name}
                  id={event?.id}
                  cid={event?.cid}
                  amountOfTickets={event?.amountOfTickets}
                  price={event?.price}
                  description={event?.description}
                  likes={event?.likes}
                  comments={event?.comments}
                />
              ))
            : null}
        </div>
      </div>
    </>
  );
}

export function FeedItem({
  createdBy,
  createdAt,
  price,
  name,
  id,
  cid,
  amountOfTickets,
  description,
  likes,
  comments,
}: Event) {
  const router = useRouter();

  const { account, web3 } = useWeb3();

  const { address } = useWallet();

  const [liked, setLiked] = useState(false);
  const [openModal, setOpenModal] = useRecoilState(modalState);
  const [eventName, setEventName] = useRecoilState(eventNameState);

  const { data, refetch } = trpc.user.get.useQuery(undefined, {
    onSuccess: (data) => {
      console.log(data);
      const userLiked = data?.userWithLikes?.likes.find(
        (like) => like.eventId === id
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
  });

  const likeMutation = trpc.event.likeEvent.useMutation({
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const likeEvent = () => {
    likeMutation.mutate({ eventId: id });
  };

  // const mint = async (address: string, value: number, id: number) => {
  //   if (web3) {
  //     const eventContract = new web3.eth.Contract(
  //       CreatedEvent.abi as AbiItem[],
  //       address
  //     );
  //     console.log(eventContract);
  //     await eventContract.methods
  //       .mint(1, id)
  //       .send({ from: account, value })
  //       .on("confirmation", async () => {
  //         const balanceOf = await eventContract.methods
  //           .balanceOf(account, id)
  //           .call();
  //         console.log(balanceOf);
  //       })
  //       .on("error", (err: Error) => {
  //         console.log(err);
  //       });
  //   }
  // };

  // useEffect(() => {
  //   if (likes && likes?.length > 0) {
  //     setLiked(
  //       likes.findIndex(
  //         (l) => l.account.toLowerCase() === user?.toLowerCase()
  //       ) !== -1
  //     );
  //   }
  // }, [likes, user]);

  // const likePost = async () => {
  //   const body = {
  //     name: name,
  //     account: account,
  //   };

  //   if (eventPage) {
  //     if (likes && likes?.length > 0 && likes.map((l) => l.account === user)) {
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
  //     if (likes && likes?.length > 0 && likes.map((l) => l.account === user)) {
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

  // const getAddress = () => {
  //   const id = 0;
  //   // const amount = prop.amount
  //   mint(address, costPerTicket, id); // pass in amount
  // };

  return (
    <ul
      key={id}
      className={`sm:relative max-w-[310px] border-[#ff9531] flex flex-col justify-center text-start font-light mb-2 px-4 py-2 sm:max-w-[300px] border rounded-lg shadow-md sm:h-[420px] 
       sm:w-full`}
    >
      <div className="flex items-center justify-between">
        <li className="sm:text-sm font-bold sm:max-w-[100px] max-w-[150px] overflow-hidden text-ellipsis pb-2">
          {createdBy}
        </li>
        <li className="sm:text-xs">
          <Moment fromNow>{createdAt}</Moment>
        </li>
      </div>
      <li
        onClick={() => router.push(`/events/${id}`)}
        className={`flex overflow-hidden border border-slate-700 h-[220px] w-[270px] rounded justify-center`}
      >
        <Image
          alt=""
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
          src={`https://gateway.pinata.cloud/ipfs/${cid}`}
          width={300}
          height={200}
        />
      </li>

      <div className=" pt-2 justify-between">
        <div className="flex justify-between sm:max-w-[150px]">
          <div className="flex space-x-2 mb-2">
            <HeartIcon
              className={`h-6 cursor-pointer ${
                liked ? "text-red-500" : "text-slate-400"
              }`}
              onClick={() => likeEvent()}
            />
            <p>{likes?.length}</p>
            <ChatIcon
              onClick={() => {
                setEventName(name);
                setOpenModal(true);
              }}
              className="h-6 text-slate-400 cursor-pointer pl-2"
            />
            <div>{comments?.length}</div>
          </div>
          <div className="flex space-x-1">
            <li className="flex">
              <p className="">${price.toFixed(2)}</p>
              {/* <Image alt="" width={24} height={24} src={eth} /> */}
            </li>
            <span className="text-slate-400">|</span>
            <li className="flex space-x-1">
              <TicketIcon className="h-5 mt-[3px] text-slate-400" />
              <p>{amountOfTickets}</p>
            </li>
          </div>
        </div>
        <li className=" text-2xl font-medium">{name}</li>
        <p
          className={`line-clamp-2 text-slate-300 max-h-[78px] sm:max-h-[40px] sm:max-w-[150px] max-w-[175px] text-ellipsis
            `}
        >
          {description}
        </p>
      </div>
      {/* {eventPage && (
        <div className="flex flex-col space-y-2 mb-2 text-sm">
          <p className="font-bold">Comments</p>
          {comments?.map((comment) => (
            <div className="overflow-hidden space-y-2 py-2 text-ellipsis border-b">
              <p className="text-slate-400 text-xs">{comment.account}</p>
              <p>{comment.comment}</p>
            </div>
          ))}
        </div>
      )} */}

      <div className="flex justify-center w-full mt-2 sm:absolute sm:bottom-0 sm:left-0">
        <button className="bg-[#ff9531] w-full sm:w-full sm:rounded-t-none text-white border border-[#ff9531] font-bold rounded-md py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out">
          Buy
        </button>
        {/* {account || address ? (
          <button
            // onClick={getAddress}
            className="bg-[#ff9531] sm:w-full sm:rounded-t-none text-white border border-[#ff9531] font-bold rounded-md py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
          >
            Mint
          </button>
        ) : (
          <button className="border-green-500 w-full sm:rounded-t-none text-green-500 border-2 rounded-md p-1 px-2 max-h-[42px]">
            Loading...
          </button>
        )} */}
      </div>
    </ul>
  );
}
