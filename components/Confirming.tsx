export default function Confirming() {
  return (
    <div className="flex flex-col fixed z-10 inset-0 justify-center items-center backdrop-blur-md backdrop-brightness-75">
      <div className="flex text-xl flex-col items-center bg-white py-8 px-8 sm:px-16 rounded shadow-md">
        <p>Confirming...</p>
        <p>This may take up to 15s</p>
        <p>Please do not leave the page.</p>
        <div className="flex mt-4 justify-center items-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
