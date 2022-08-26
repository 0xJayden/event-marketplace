import { PhotographIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

export default function EventMarketplace({
  data,
  account,
}: {
  data: any;
  account: string;
}) {
  const router = useRouter();

  return (
    <div className="text-center justify-center m-4">
      <div className="relative">
        <h1 className="text-blue-500 text-6xl mb-6 mt-8">
          An Event Market Place
        </h1>
        <p className="mb-6">
          A unique, exciting way to book & host events powered by the
          blockchain.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push("/explore-events")}
            className="py-2 px-4 bg-black border-2 border-black text-white rounded-md hover:bg-white hover:text-black transition duration-200 ease-in-out"
          >
            Explore
          </button>
          <button
            onClick={() => {
              if (!account) {
                router.push("/connect");
              } else {
                router.push("/create-event");
              }
            }}
            className="py-2 px-4 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition duration-200 ease-in-out"
          >
            Create
          </button>
        </div>
      </div>

      <div className="absolute overflow-hidden -z-20 inset-0 opacity-50">
        <img className="w-full" src={data.events[0].image} />
        <div className="absolute inset-0 backdrop-blur-lg"></div>
      </div>
      <div className="flex flex-col w-full items-center justify-center mt-8 sm:mt-32">
        <p className="mb-4">Featured Event</p>
        <div className="flex relative justify-center w-5/6 sm:max-w-[350px] hover:scale-110 hover:shadow-md transition duration-300 ease-in-out">
          {data.events.length > 0 ? (
            <>
              <img
                onClick={() => router.push(`/events/${data.events[0].name}`)}
                className="rounded-md sm:max-w-[350px] sm:w-full"
                src={data.events[0].image}
              />
              <div className="flex absolute w-full sm:max-w-[350px] p-4 bottom-0 rounded-b text-white text-3xl justify-start backdrop-blur-sm">
                <p>{data.events[0].name}</p>
              </div>
            </>
          ) : (
            <PhotographIcon className="h-[100px]" />
          )}
        </div>
      </div>
    </div>
  );
}
