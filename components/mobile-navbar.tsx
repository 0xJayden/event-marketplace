import { useRouter } from "next/router";
import {
  HomeIcon,
  PlusIcon,
  MapIcon,
  UserIcon,
} from "@heroicons/react/outline";

interface Menu {
  openMenu: boolean;
  web3Handler: () => Promise<void>;
  account: string;
}

export default function MobileNavbar({ openMenu, web3Handler, account }: Menu) {
  const router = useRouter();

  return (
    <div
      className={`flex fixed z-10 right-0 border-l shadow-md bg-white bottom-0 top-[60px] py-2 px-4 ${
        openMenu
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 translate-x-full transition duration-500 ease-out"
      }`}
    >
      <ul className="flex flex-col h-5/6 justify-between pt-4">
        <button
          onClick={() => {
            router.push("/");
          }}
        >
          <li className="flex justify-start items-center space-x-4">
            <HomeIcon className="h-7" />
            <p>Home</p>
          </li>
        </button>
        <li
          onClick={() => {
            router.push("/explore-events");
          }}
          className="flex justify-start items-center space-x-4 cursor-pointer"
        >
          <MapIcon className="h-7" />
          <p>Explore</p>
        </li>
        <button onClick={() => router.push("/create-event")}>
          <li className="flex justify-start items-center space-x-4">
            <PlusIcon className="h-7" />
            <p>Create</p>
          </li>
        </button>
        <li
          onClick={() => {
            if (!account) return console.log("no account");
            router.push(`/profile/${account}`);
          }}
          className="flex justify-start items-center space-x-4 cursor-pointer"
        >
          <UserIcon className="h-7" />
          <p>Profile</p>
        </li>
        <li className="flex justify-center">
          {!account ? (
            <button
              onClick={web3Handler}
              className="bg-blue-500 border-2 border-blue-500 text-white p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out"
            >
              Connect
            </button>
          ) : (
            <button className="bg-blue-500 border-2 border-blue-500 text-white p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out">
              Connected
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
