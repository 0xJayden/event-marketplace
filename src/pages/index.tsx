import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PhotographIcon } from "@heroicons/react/outline";
import { Cairo } from "next/font/google";

import Navbar from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";
import { trpc } from "../utils/trpc";

declare global {
  interface Window {
    ethereum: any;
  }
}

const cairo = Cairo({ subsets: ["latin"] });

function App() {
  return (
    <main
      style={cairo.style}
      className="flex flex-col items-center bg-slate-800"
    >
      <Head>
        <title>Socialize</title>
      </Head>
      <Navbar />
      <EventMarketplace />
    </main>
  );
}

function EventMarketplace() {
  const { address } = useWallet();

  return (
    <div className="text-center relative min-h-screen p-2 justify-center">
      <BackgroundImage />
      <div className="relative space-y-6">
        <h1 className="text-transparent bg-gradient-to-r bg-clip-text drop-shadow from-[#ff9531] to-[#ffd29e] text-6xl pt-8">
          Socialize
        </h1>
        <p className="text-gray-200">
          A unique, exciting way to book & host events powered by the
          blockchain.
        </p>
        <div className="flex justify-center space-x-4 font-bold">
          <Link href={"/explore-events"}>
            <p className="py-2 px-4 bg-slate-800 border-2 border-slate-800 text-slate-200 rounded-md hover:bg-transparent hover:text-slate-800 transition duration-200 ease-in-out">
              Explore
            </p>
          </Link>
          <Link href={"/create-event"}>
            <p className="py-2 px-4 border-2 border-[#ff9531] text-[#ff9531] rounded-md hover:bg-[#ff9531] hover:text-white transition duration-200 ease-in-out">
              Create
            </p>
          </Link>
        </div>
      </div>
      {/* <p className="text-sm">{address}</p> */}
      <FeaturedEvent />
    </div>
  );
}

const FeaturedEvent = () => {
  const { data, isError, isLoading } = trpc.event.getAll.useQuery();

  if (isError) return <p>error</p>;

  if (isLoading)
    return (
      <div className="flex h-[350px] justify-center items-center">
        <div
          className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
          role="status"
        >
          {/* <span className="visually-hidden">Loading...</span> */}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col w-full items-center justify-center mt-8 sm:mt-32">
      <p className="mb-4 font-bold text-gray-800">Featured Event</p>
      <div className="flex justify-center sm:max-w-[350px] hover:scale-105 hover:shadow-md transition duration-300 ease-in-out">
        {data?.events?.length && data.events.length > 0 ? (
          <Link href={`/events/${data.events[0].id}`}>
            <div className="overflow-hidden relative h-[300px] w-[300px]">
              <Image
                alt=""
                height={300}
                width={300}
                className="rounded-md h-full w-full object-cover sm:max-w-[350px] sm:w-full"
                src={`https://gateway.pinata.cloud/ipfs/${data.events[0].cid}`}
              />
              <div className="flex absolute w-full sm:max-w-[350px] p-4 bottom-0 rounded-b text-white text-3xl justify-start backdrop-blur-sm">
                <p>{data.events[0].name}</p>
              </div>
            </div>
          </Link>
        ) : (
          <PhotographIcon className="h-[100px]" />
        )}
      </div>
    </div>
  );
};

const BackgroundImage = () => {
  const { data, isError, isLoading } = trpc.event.getAll.useQuery();

  return (
    <div className="absolute overflow-hidden inset-0 opacity-40">
      {data && data.events ? (
        <Image
          alt=""
          height={1000}
          width={1000}
          className="w-full"
          src={`https://gateway.pinata.cloud/ipfs/${data.events[0].cid}`}
        />
      ) : (
        <div className="bg-slate-600 w-full h-[300px]"></div>
      )}
      <div className="absolute inset-0 backdrop-blur"></div>
    </div>
  );
};

export default App;
