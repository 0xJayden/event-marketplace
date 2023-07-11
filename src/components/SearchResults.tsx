import { TicketIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SearchResults({
  searchResults,
}: {
  searchResults: Array<any>;
}) {
  const router = useRouter();

  return (
    <>
      {searchResults?.map((item) => (
        <div
          key={item.id}
          onClick={() => router.push(`/events/${item.name}`)}
          className="flex items-center p-4 border-b backdrop-blur backdrop-brightness-50 text-white hover:bg-slate-200"
        >
          <div>
            <Image
              alt=""
              className="w-full rounded-lg h-full object-cover cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
              src={`https://gateway.pinata.cloud/ipfs/${item.cid}`}
              width={100}
              height={100}
            />
          </div>
          <div className="w-full mx-4">
            <p>{item.name}</p>
            <div className="flex items-center">
              <p className="text-gray-400">{item.amountOfTickets}</p>
              <TicketIcon className="h-4 ml-2 text-orange-500" />
            </div>
          </div>
          <div className="w-20">${item.price.toFixed(2)}</div>
        </div>
      ))}
    </>
  );
}
