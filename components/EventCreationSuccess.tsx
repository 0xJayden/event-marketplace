import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

export default function EventCreationSuccess({
  setSuccess,
}: {
  setSuccess: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const explore = () => {
    setSuccess(false);
    router.push("/explore-events");
  };
  const home = () => {
    setSuccess(false);
    router.push("/");
  };

  return (
    <div className="flex text-xl flex-col fixed z-10 top-0 bottom-0 right-0 left-0 justify-center items-center backdrop-blur-md backdrop-brightness-75">
      <div className="flex text-xl flex-col items-center bg-white py-8 px-16 rounded shadow-md">
        <p className="mb-8">Event Creation Success!</p>
        <div className="space-x-8">
          <button
            className="p-2 bg-black border border-black text-white rounded-md shadow hover:bg-white hover:text-black transition duration-300 ease-out"
            onClick={explore}
          >
            Explore
          </button>
          <button
            className="p-2 px-3 bg-white border border-black rounded-md shadow hover:bg-black hover:text-white transition duration-300 ease-out"
            onClick={home}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
