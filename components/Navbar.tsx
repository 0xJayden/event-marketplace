import { useState } from "react";
import { MenuIcon, SearchIcon, XIcon } from "@heroicons/react/outline";
import MobileNavbar from "./mobile-navbar";

interface Navbar {
  web3Handler: () => Promise<void>;
  account: string;
}

export default function Navbar({ web3Handler, account }: Navbar) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <>
      <div className="flex sticky top-0 z-20 bg-white border-b p-4 shadow-sm justify-between items-center w-full sm:w-full">
        <div className="ml-4 text-lg sm:ml-4">EMP</div>
        <ul className="flex items-center w-24 mr-4 justify-end">
          {/* <li className="mr-8 sm:mr-16 sm:flex">
            <SearchIcon className="h-7 sm:hidden" />
            <input
              type="search"
              placeholder="Search"
              className="border rounded px-2 hidden sm:inline sm:w-[400px]"
            ></input>
          </li> */}
          <li className="cursor-pointer" onClick={() => setOpenMenu(!openMenu)}>
            {!openMenu ? (
              <MenuIcon className="h-7" />
            ) : (
              <XIcon className="h-7" />
            )}
          </li>
        </ul>
      </div>
      <MobileNavbar
        openMenu={openMenu}
        web3Handler={web3Handler}
        account={account}
      />
    </>
  );
}
