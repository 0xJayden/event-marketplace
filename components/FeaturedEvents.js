import getEventData from "./get-event-data";
import EventItem from "./event-item";

export default function FeaturedEvents({ mint }) {
  const { data, error } = getEventData();

  if (error) return "error";
  if (!data) return "loading...";
  return (
    <div className="flex-col text-start w-full">
      <div className="flex justify-center">
        <h1 className="my-2 text-xs">Featured</h1>
      </div>

      <div className="flex gap-3 overflow-x-auto before:w-[0.01vh] after:w-[0.01vh]">
        {data.events.map((event) => (
          <EventItem
            mint={mint}
            address={event?.address}
            key={event?.name}
            name={event?.name}
            symbol={event?.symbol}
            image={event?.image}
            amountOfTickets={event?.amountOfTickets}
            costPerTicket={event?.costPerTicket}
          />
        ))}
      </div>
    </div>
  );
}
