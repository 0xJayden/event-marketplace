import { ArrowLeftIcon } from "@heroicons/react/outline";
import SearchResults from "./SearchResults";

export default function MobileSearchBar({
  openSearch,
  setOpenSearch,
  handleSearch,
  setSearchResults,
  searchResults,
}) {
  return (
    <div
      className={`fixed flex items-center top-0 w-full z-30 ${
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
        className="pl-4 bg-white"
      >
        <ArrowLeftIcon className="w-7" />
      </div>

      <input
        className="rounded-md p-5 w-full h-full"
        type="search"
        placeholder="Search app"
        onChange={handleSearch}
      ></input>
      <div className="absolute top-[60px] bg-white w-full">
        {searchResults.length > 0 && (
          <SearchResults searchResults={searchResults} />
        )}
      </div>
    </div>
  );
}
