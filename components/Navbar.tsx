import { BaseSyntheticEvent, useState } from "react";
import {
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import MobileNavbar from "./mobile-navbar";
import MobileSearchBar from "./MobileSearchBar";
import SearchResults from "./SearchResults";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface Navbar {
  web3Handler: () => Promise<void>;
  account: string;
  data: any;
}

export default function Navbar({ web3Handler, account, data }: Navbar) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [pfp, setPfp] = useState<string>();

  const router = useRouter();

  const handleSearch = (e: BaseSyntheticEvent) => {
    if (!e.target.value) return setSearchResults([]);
    const results = data.events.filter(
      (event: any) =>
        event.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        event.description.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(results);
  };

  const loadProfilePic = async () => {
    const result = await fetch("../api/get-profiles").then((res) => res.json());

    const profile = await result.profiles.find(
      (res: any) => res.account === account
    );
    setPfp(profile?.pfp);
  };

  useEffect(() => {
    loadProfilePic();
  }, [account]);

  return (
    <>
      <div className="flex sticky top-0 z-20 bg-white border-b p-4 shadow-sm justify-between items-center w-full">
        <div className="ml-4 text-lg text-blue-500 sm:ml-4 sm:mr-6">EMP</div>
        <div className="relative sm:flex sm:border sm:rounded sm:w-full sm:max-w-[800px] sm:mr-8">
          <div className="p-2 pr-0 hidden sm:inline">
            <SearchIcon className="h-6 text-gray-300" />
          </div>
          <input
            type="search"
            placeholder="Search"
            className="rounded w-full outline-none py-2 pl-2 hidden sm:inline"
            onChange={handleSearch}
          ></input>
          <div className="hidden absolute z-40 top-[30px] bg-white w-full max-w-[800px] sm:top-[45px] sm:inline">
            {searchResults.length > 0 && (
              <SearchResults searchResults={searchResults} />
            )}
          </div>
        </div>
        <ul className="flex items-center justify-end mr-4 text-gray-700 font-semibold sm:justify-between sm:min-w-[300px] sm:max-w-[400px]">
          <SearchIcon
            onClick={() => setOpenSearch(true)}
            className="h-7 mr-6 sm:hidden"
          />
          <li
            className="cursor-pointer sm:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {!openMenu ? (
              <MenuIcon className="h-7" />
            ) : (
              <XIcon className="h-7" />
            )}
          </li>
          <li
            onClick={() => router.push("/")}
            className="hidden cursor-pointer sm:inline"
          >
            <p>Home</p>
          </li>
          <li
            onClick={() => router.push("/explore-events")}
            className="hidden cursor-pointer sm:inline"
          >
            <p>Explore</p>
          </li>
          <li
            onClick={() => {
              if (!account) {
                router.push("/connect");
              } else {
                router.push("/create-event");
              }
            }}
            className="hidden cursor-pointer sm:inline"
          >
            <p>Create</p>
          </li>
          <li
            onClick={() => {
              if (!account) {
                router.push("/connect");
              } else {
                router.push(`/profile/${account}`);
              }
            }}
            className="hidden h-6 w-6 rounded-full overflow-hidden cursor-pointer sm:inline"
          >
            {!pfp ? (
              <p>
                <UserCircleIcon className="h-6" />
              </p>
            ) : (
              <img src={pfp} />
            )}
          </li>
        </ul>
      </div>
      <MobileNavbar
        openMenu={openMenu}
        web3Handler={web3Handler}
        account={account}
      />
      <MobileSearchBar
        setSearchResults={setSearchResults}
        handleSearch={handleSearch}
        openSearch={openSearch}
        setOpenSearch={setOpenSearch}
        searchResults={searchResults}
      />
    </>
  );
}
