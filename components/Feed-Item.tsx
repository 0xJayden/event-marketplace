import { useRouter } from "next/router";
import Image from "next/image";
import Moment from "react-moment";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { modalState, eventNameState } from "../atoms/modalAtom";
import { ChatIcon, HeartIcon, TicketIcon } from "@heroicons/react/outline";
import eth from "../public/eth.png";

interface EventItem {
  address: string;
  account: string;
  user: string;
  time: Date;
  costPerTicket: number;
  mint: (address: string, costPerTicket: number, id: number) => Promise<void>;
  name: string;
  image: string;
  amountOfTickets: number;
  description: string;
  eventPage?: boolean;
  likes?: Array<{ account: string }>;
  comments?: Array<{ account: string; comment: string }>;
}

export default function FeedItem({
  address,
  account,
  user,
  time,
  costPerTicket,
  mint,
  name,
  image,
  amountOfTickets,
  description,
  eventPage,
  likes,
  comments,
}: EventItem) {
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [openModal, setOpenModal] = useRecoilState(modalState);
  const [eventName, setEventName] = useRecoilState(eventNameState);

  useEffect(() => {
    if (likes && likes?.length > 0) {
      setLiked(
        likes.findIndex(
          (l) => l.account.toLowerCase() === user?.toLowerCase()
        ) !== -1
      );
    }
  }, [likes, user]);

  const likePost = async () => {
    const body = {
      name: name,
      account: account,
    };

    if (eventPage) {
      if (likes && likes?.length > 0 && likes.map((l) => l.account === user)) {
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
      if (likes && likes?.length > 0 && likes.map((l) => l.account === user)) {
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

  const getAddress = () => {
    const id = 0;
    // const amount = prop.amount
    mint(address, costPerTicket, id); // pass in amount
  };

  return (
    <ul
      className={`sm:relative text-start font-light mb-2 px-4 py-2 w-5/6 sm:max-w-[300px] border rounded-lg shadow-md sm:h-[420px] ${
        eventPage && "min-w-full h-auto shadow-none rounded-none border-0"
      } sm:w-full`}
    >
      <div className="flex items-center justify-between">
        <li className="sm:text-sm sm:max-w-[100px] max-w-[150px] overflow-hidden text-ellipsis pb-2">
          {account}
        </li>
        <li className="sm:text-xs">
          <Moment fromNow>{time}</Moment>
        </li>
      </div>
      <li
        onClick={() => router.push(`/events/${name}`)}
        className={`flex justify-center`}
      >
        <img
          className="mb-2 cursor-pointer border hover:scale-105 transition duration-300 ease-in-out"
          src={image}
        />
      </li>

      <div className="flex justify-between">
        <div className="sm:max-w-[150px]">
          <div className="flex space-x-2 mb-2">
            <HeartIcon
              className={`h-6 cursor-pointer ${
                liked ? "text-red-500" : "text-gray-500"
              }`}
              onClick={likePost}
            />
            <p>{likes?.length}</p>
            <ChatIcon
              onClick={() => {
                setEventName(name);
                setOpenModal(true);
              }}
              className="h-6 text-gray-500 cursor-pointer pl-2"
            />
            <div>{comments?.length}</div>
          </div>
          <li className="pb-2 font-medium">{name}</li>
          <p
            className={`line-clamp-2 text-gray-700 text-[12px] max-h-[78px] sm:max-h-[40px] sm:max-w-[150px] max-w-[175px] text-ellipsis ${
              eventPage && "max-h-screen max-w-[200px]"
            }`}
          >
            {description}
          </p>
        </div>
        <div className="space-y-2">
          <li className="flex space-x-2 justify-end items-center">
            <p>{amountOfTickets}</p>
            <TicketIcon className="h-6 text-yellow-500" />
          </li>
          <li className="flex justify-end">
            <p className="mr-1">{costPerTicket}</p>
            <Image width={24} height={24} src={eth} />
          </li>
        </div>
      </div>
      {eventPage && (
        <div className="flex flex-col space-y-2 mb-2 text-sm">
          <p className="font-bold">Comments</p>
          {comments?.map((comment) => (
            <div className="overflow-hidden space-y-2 py-2 text-ellipsis border-b">
              <p className="text-gray-400 text-xs">{comment.account}</p>
              <p>{comment.comment}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center w-full mt-2 sm:absolute sm:bottom-0 sm:left-0">
        {address ? (
          <button
            onClick={getAddress}
            className="bg-green-500 sm:w-full sm:rounded-t-none text-white border border-green-500 font-bold rounded-md py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
          >
            Mint
          </button>
        ) : (
          <button className="border-green-500 w-full sm:rounded-t-none text-green-500 border-2 rounded-md p-1 px-2 max-h-[42px]">
            Loading...
          </button>
        )}
      </div>
    </ul>
  );
}
