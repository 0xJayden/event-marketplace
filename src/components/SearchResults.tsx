import { TicketIcon, UserIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SearchResults({
  searchResults,
}: {
  searchResults: Array<any>;
}) {
  const router = useRouter();

  return (
    <div className={`overflow-y-scroll max-h-[770px]`}>
      {searchResults?.map((item) => (
        <div
          key={item.id}
          onClick={() =>
            item.cid
              ? router.push(`/events/${item.id}`)
              : router.push(`/profile/${item.id}`)
          }
          className="flex items-center z-[100] p-4 border-b backdrop-blur backdrop-brightness-50 text-white hover:bg-slate-200"
        >
          <div>
            {item.cid ? (
              <Image
                alt=""
                className=" rounded-lg object-cover cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                src={`https://gateway.pinata.cloud/ipfs/${item.cid}`}
                width={100}
                height={100}
              />
            ) : item.image ? (
              <Image
                width={100}
                height={100}
                className="rounded-lg object-cover cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                alt=""
                src={item.image}
              />
            ) : (
              <UserIcon className="h-[70px] text-slate-400" />
            )}
          </div>
          <div className="w-full mx-4">
            <p>{item.name}</p>
            {item.amountOfTickets && (
              <div className="flex items-center">
                <p className="text-gray-400">{item.amountOfTickets}</p>
                <TicketIcon className="h-4 ml-2 text-orange-500" />
              </div>
            )}
          </div>
          {item.price ? (
            <div className="w-20">${item.price.toFixed(2)}</div>
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
}
