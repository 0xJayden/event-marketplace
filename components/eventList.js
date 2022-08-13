import FeedItem from "./Feed-Item";
import getEventData from "./get-event-data";

export default function eventList({ mint }) {
  const { data, error } = getEventData();

  if (error) return "error";
  if (!data) return "loading...";
  return (
    <div className="flex flex-col items-center gap-3 mb-4 sm:grid-cols-4 sm:grid">
      {data.events.map((event) => (
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
        />
      ))}
    </div>
  );
}
