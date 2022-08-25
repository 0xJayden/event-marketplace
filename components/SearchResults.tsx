import { TicketIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

export default function SearchResults({
  searchResults,
}: {
  searchResults: Array<{
    name: string;
    image: string;
    amountOfTickets: number;
    costPerTicket: number;
  }>;
}) {
  const router = useRouter();

  return (
    <>
      {searchResults?.map((item) => (
        <div
          onClick={() => router.push(`/events/${item.name}`)}
          className="flex items-center p-4 border-b hover:bg-slate-200"
        >
          <div>
            <img
              className="h-6 mr-8 sm:mr-20 ml-4 rounded-full sm:h-10"
              src={item.image}
            />
          </div>
          <div className="w-full mx-4">
            <p>{item.name}</p>
            <div className="flex items-center">
              <p className="text-gray-400">{item.amountOfTickets}</p>
              <TicketIcon className="h-4 ml-2 text-yellow-500" />
            </div>
          </div>
          <div className="w-20">{item.costPerTicket} ETH</div>
        </div>
      ))}
    </>
  );
}
