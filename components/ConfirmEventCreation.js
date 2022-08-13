export default function ConfirmEventCreation({ createEvent, cancel }) {
  return (
    <div className="flex p-4 mt-4 flex-col items-center w-10/12 bg-green-400 rounded-lg shadow-lg">
      <h1 className="mb-8">Comfirm event creation?</h1>
      <div className="flex font-light w-full justify-between">
        <button
          className="p-2 bg-black text-white rounded-md shadow"
          onClick={createEvent}
        >
          Confirm
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded-md"
          onClick={cancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
