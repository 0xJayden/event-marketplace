import { useRouter } from "next/router";

export default function EventCreationSuccess({
  setSuccess,
  setOpenCreateEvent,
}) {
  const router = useRouter();
  const handler = () => {
    setSuccess(false);
    setOpenCreateEvent(false);
  };
  return (
    <div className="flex flex-col fixed z-10 top-0 bottom-0 right-0 left-0 justify-center items-center backdrop-blur-md">
      <p className="mb-8">Event Creation Success!</p>
      <button
        className="p-2 bg-black text-white rounded-md shadow"
        onClick={handler}
      >
        Back
      </button>
    </div>
  );
}
