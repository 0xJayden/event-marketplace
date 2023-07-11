import { ArrowLeftIcon } from "@heroicons/react/outline";
import { BaseSyntheticEvent, Dispatch, SetStateAction } from "react";
import SearchResults from "./SearchResults";

interface MobileSearchBar {
  openSearch: boolean;
  setOpenSearch: Dispatch<SetStateAction<boolean>>;
  handleSearch: (e: BaseSyntheticEvent) => void;
  setSearchResults: Dispatch<SetStateAction<never[]>>;
  searchResults: Array<{
    name: string;
    image: string;
    amountOfTickets: number;
    costPerTicket: number;
  }>;
}

export default function MobileSearchBar({
  openSearch,
  setOpenSearch,
  handleSearch,
  setSearchResults,
  searchResults,
}: MobileSearchBar) {
  return (
    <div
      className={`fixed flex bg-slate-800 items-center top-0 w-full z-30 ${
        openSearch
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 translate-x-full transition duration-500 ease-out"
      }`}
    >
      <div
        onClick={() => {
          setOpenSearch(!openSearch);
          setSearchResults([]);
        }}
        className="pl-4"
      >
        <ArrowLeftIcon className="w-7 text-white" />
      </div>

      <input
        className="rounded-md bg-transparent p-5 w-full h-full outline-none text-white"
        type="search"
        placeholder="Search app"
        onChange={handleSearch}
      ></input>
      <div className="absolute top-[60px] w-full">
        {searchResults.length > 0 && (
          <SearchResults searchResults={searchResults} />
        )}
      </div>
    </div>
  );
}
