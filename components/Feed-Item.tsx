import { useRouter } from "next/router";

import Moment from "react-moment";
import { TicketIcon } from "@heroicons/react/outline";

interface EventItem {
  address: string;
  account: string;
  time: Date;
  costPerTicket: number;
  mint: (address: string, costPerTicket: number, id: number) => Promise<void>;
  name: string;
  image: string;
  amountOfTickets: number;
  description: string;
  eventPage?: boolean;
}

export default function FeedItem({
  address,
  account,
  time,
  costPerTicket,
  mint,
  name,
  image,
  amountOfTickets,
  description,
  eventPage,
}: EventItem) {
  const router = useRouter();

  const getAddress = () => {
    const id = 0;
    // const amount = prop.amount
    mint(address, costPerTicket, id); // pass in amount
  };

  return (
    <ul
      className={`text-start font-light mb-2 px-4 py-2 w-5/6 border rounded-lg shadow-md max-h-[500px] ${
        eventPage &&
        "min-w-full max-h-screen min-h-screen rounded-none border-0"
      } sm:w-full`}
    >
      <div className="flex justify-between">
        <li className="max-w-[150px] overflow-hidden text-ellipsis pb-2">
          {account}
        </li>
        <li>
          <Moment fromNow>{time}</Moment>
        </li>
      </div>
      <li
        onClick={() => router.push(`/events/${name}`)}
        className="flex justify-center"
      >
        <img className="mb-2 border" src={image} />
      </li>

      <div className="flex justify-between">
        <div>
          <li className="pb-2">{name}</li>
          <p
            className={`overflow-hidden text-[12px] max-h-[78px] max-w-[175px] text-ellipsis ${
              eventPage && "max-h-screen max-w-[200px]"
            }`}
          >
            {description}
          </p>
        </div>
        <div>
          <li className="flex space-x-2 justify-end items-center">
            <TicketIcon className="h-6 text-yellow-500" />
            <p>{amountOfTickets}</p>
          </li>
          <li>Price: {costPerTicket} ETH</li>
        </div>
      </div>
      <div className="flex flex-col items-end my-2"></div>

      <div className="flex justify-center">
        {address ? (
          <div>
            <button
              onClick={getAddress}
              className="bg-green-500 text-white border border-green-500 font-normal rounded-md py-2 px-6 max-h-[42px] hover:bg-white hover:text-green-500 transition duration-500 ease-out"
            >
              Mint
            </button>
          </div>
        ) : (
          <button className="border-green-500 text-green-500 border-2 rounded-md p-1 px-2 max-h-[42px]">
            Loading...
          </button>
        )}
      </div>
    </ul>
  );
}
