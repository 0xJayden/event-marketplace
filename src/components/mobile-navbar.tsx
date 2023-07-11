import { useRouter } from "next/router";
import {
  HomeIcon,
  PlusIcon,
  MapIcon,
  UserIcon,
  LogoutIcon,
  LoginIcon,
} from "@heroicons/react/outline";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useWeb3 } from "../hooks/useWeb3";
import { useWallet } from "../hooks/useWallet";

interface Menu {
  openMenu: boolean;
}

export default function MobileNavbar({ openMenu }: Menu) {
  const router = useRouter();

  // const { account, web3Handler } = useWeb3();

  const { address, session } = useWallet();
  console.log(session, "session");

  return (
    <div
      className={`flex fixed z-10 right-0 shadow-md backdrop-blur backdrop-brightness-50 bottom-0 top-[60px] py-2 px-4 text-gray-200 font-bold ${
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
        <button
          onClick={() => {
            // if (!account) {
            //   router.push("/connect");
            // } else {
            router.push(`/create-event`);
            // }
          }}
        >
          <li className="flex justify-start items-center space-x-4">
            <PlusIcon className="h-7" />
            <p>Create</p>
          </li>
        </button>
        <li
          // onClick={() => {
          //   router.push(`/profile/${account ? account : address}`);
          // }}
          onClick={() => {
            router.push(`/profile/${session?.user?.id}`);
          }}
          className="flex justify-start items-center space-x-4 cursor-pointer"
        >
          <UserIcon className="h-7" />
          <p>Profile</p>
        </li>
        {/* {!address && (
          <li className="flex justify-center">
            {!account ? (
              <button
                onClick={web3Handler}
                disabled={!!address}
                className={`bg-[#ff9531] border-2 border-[#ff9531] text-gray-200 p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out ${
                  !!address && "opacity-50"
                }`}
              >
                Connect
              </button>
            ) : (
              <button className="bg-blue-500 border-2 border-blue-500 text-white p-2 rounded-md hover:bg-white hover:text-blue-500 transition duration-200 ease-in-out">
                Connected
              </button>
            )}
          </li>
        )} */}
        <li>
          {!session ? (
            <Link href="/auth/signIn">
              <div className="flex items-center space-x-2">
                <LoginIcon className="h-7" />
                <p>Log In</p>
              </div>
            </Link>
          ) : (
            <button
              className="flex space-x-2 items-center"
              onClick={() => signOut()}
            >
              <LogoutIcon className="h-7" />
              <p>Logout</p>
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
