interface ConfirmEventCreation {
  createEvent: () => Promise<void>;
  cancel: () => Promise<void>;
}

export default function ConfirmEventCreation({
  createEvent,
  cancel,
}: ConfirmEventCreation) {
  return (
    <div className="flex fixed inset-0 z-10 justify-center flex-col items-center backdrop-blur-md backdrop-brightness-75">
      <div className="flex text-xl flex-col items-center bg-white py-8 px-16 rounded shadow-md">
        <h1 className="mb-8">Confirm event creation?</h1>
        <div className="flex font-light space-x-8">
          <button
            className="p-2 bg-green-500 border-green-500 border text-white rounded-md shadow hover:bg-white hover:text-green-500 transition duration-300 ease-out"
            onClick={createEvent}
          >
            Confirm
          </button>
          <button
            className="p-2 bg-red-500 border-red-500 border text-white rounded-md hover:bg-white hover:text-red-500 transition duration-300 ease-out"
            onClick={cancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
