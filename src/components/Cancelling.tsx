export default function Cancelling() {
  return (
    <div className="flex flex-col fixed z-20 inset-0 justify-center items-center backdrop-blur-md backdrop-brightness-75">
      <div className="flex text-xl flex-col items-center bg-slate-700 py-8 px-8 sm:px-16 rounded shadow-md">
        <p>Cancelling...</p>
        <p>Please do not leave the page.</p>
        <div className="flex mt-4 justify-center items-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
