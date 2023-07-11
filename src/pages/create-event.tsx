import { useRef, useState, FormEvent, ChangeEvent } from "react";
import { PhotographIcon, XIcon } from "@heroicons/react/outline";
import { AbiItem } from "web3-utils";
import { Cairo } from "next/font/google";

import CreateEventAbi from "../../abis/CreateEvent.json";
import Loading from "../components/Loading";
import ConfirmEventCreation from "../components/ConfirmEventCreation";
import Cancelling from "../components/Cancelling";
import Confirming from "../components/Confirming";
import EventCreationSuccess from "../components/EventCreationSuccess";
import Navbar from "../components/Navbar";
import { useWeb3 } from "../hooks/useWeb3";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useWallet } from "../hooks/useWallet";

const cairo = Cairo({ subsets: ["latin"] });

export default function CreateEvent() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const amountOfTicketsInputRef = useRef<HTMLInputElement>(null);
  const costPerTicketInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const [image, setImage] = useState<File>();
  const [eventPlaced, setEventPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  const { account, web3 } = useWeb3();

  const { address } = useWallet();

  const { data: session } = useSession();

  const eventMutation = trpc.event.create.useMutation({
    onError: (error) => {
      console.log(error);
      setIsLoading(false);
    },
    onSuccess: (data) => {
      console.log(data);
      setEventPlaced(true);
      setIsLoading(false);
      setSuccess(true);
    },
  });

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!session?.user?.email) return console.log("no email");

    const enteredName = nameInputRef.current?.value;
    const enteredAmountOfTickets = amountOfTicketsInputRef.current?.value;
    const enteredCostPerTicket = costPerTicketInputRef.current?.value;
    const enteredDescription = descriptionInputRef.current?.value;

    if (
      enteredName &&
      enteredAmountOfTickets &&
      enteredCostPerTicket &&
      enteredDescription &&
      image
    ) {
      setEventName(enteredName);

      if (!address) return console.log("no address");

      eventMutation.mutate({
        name: enteredName,
        image: imagePreviewSrc,
        amountOfTickets: +enteredAmountOfTickets,
        pricePerTicket: +enteredCostPerTicket,
        description: enteredDescription,
        createdBy: session.user.email,
      });
    }
  };

  const showImagePreview = (e: ChangeEvent) => {
    const image = (e.target as HTMLInputElement).files?.[0];
    if (!image) return;
    setImage(image);

    if (!["image/jpeg", "image/png"].includes(image.type)) return;

    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", (e) => {
      if (e.target == null) return;
      if (e.target.result == null || typeof e.target.result !== "string")
        return;
      const result = e.target.result;
      setImagePreviewSrc(result);
      setIsImageSelected(true);
    });
  };

  const createEvent = async () => {
    setConfirming(true);

    if (web3 == null) return;

    const networkId = await web3.eth.net.getId();

    if (networkId !== null) {
      const newEvent = new web3.eth.Contract(
        CreateEventAbi.abi as AbiItem[],
        (CreateEventAbi.networks as any)[networkId].address
      );
      console.log(newEvent);

      const result = await fetch("api/get-events").then((res) => res.json());

      for (let i = 0; result.events.length > i; i++) {
        if (result.events[i].name === eventName) {
          const cost = result.events[i].costPerTicket;
          const costToWei = web3.utils.toWei(cost, "ether");
          await newEvent.methods
            .create(
              result.events[i].name,
              result.events[i].cid,
              result.events[i].amountOfTickets,
              costToWei
            )
            .send({ from: account ? account : address, value: 0 })
            .on(
              "confirmation",
              async (confirmationNumber: any, receipt: any) => {
                const createdEventAddress = receipt.events["0"].address;
                console.log(createdEventAddress);
                const body = {
                  address: createdEventAddress,
                  name: eventName,
                };
                await fetch("api/post-event-address", {
                  method: "PUT",
                  body: JSON.stringify(body),
                  headers: {
                    "Content-Type": "application/json",
                  },
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Success:", data);
                  });
                setConfirming(false);
                setSuccess(true);
                setEventPlaced(false);
              }
            )
            .on("error", (error: Error) => {
              console.log(error);
              setConfirming(false);
            });
        } else {
          console.log("no matching events");
        }
      }
    }
  };

  const cancel = async () => {
    setConfirming(false);
    setCancelling(true);
    const result = await fetch("api/get-events").then((res) => res.json());

    for (let i = 0; result.events.length > i; i++) {
      if (result.events[i].name === eventName) {
        const body = {
          name: eventName,
        };
        await fetch("api/delete-event", {
          method: "DELETE",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Success:", data);
          });
      } else {
        console.log("error");
      }
      setCancelling(false);
      setEventPlaced(false);
    }
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <Navbar />
      </div>
      <div
        style={cairo.style}
        className="flex min-h-screen w-full bg-slate-800 text-white justify-center"
      >
        {isLoading ? <Loading /> : null}
        {cancelling ? <Cancelling /> : null}
        {confirming ? <Confirming /> : null}
        {success ? <EventCreationSuccess setSuccess={setSuccess} /> : null}
        <div className="flex my-4 flex-col items-center w-5/6 sm:max-w-[1000px]">
          {!session && <p>Please sign in to create an event.</p>}
          <div className="flex sm:w-auto">
            <h1 className="text-4xl text-center font-bold my-4">
              Create Event
            </h1>
          </div>
          {/* <div className="flex items-start w-5/6 sm:w-auto mb-4">
            <div className="text-gray-300 flex items-center space-x-1">
              <p className="text-xl text-red-500">*</p>
              <p className="text-sm">Required Fields</p>
            </div>
          </div> */}

          <form
            className="flex space-y-2 flex-col w-full"
            onSubmit={submitHandler}
            id="eventCreate"
          >
            {/* <div className="flex self-center font-bold">
              <p>Select Image</p>
            </div> */}
            {isImageSelected ? (
              <div className="relative flex justify-center">
                <button
                  onClick={() => {
                    setIsImageSelected(!isImageSelected);
                  }}
                  className="absolute flex sm:left-[420px] rounded-full backdrop-brightness-50 cursor-pointer left-5 top-1 hover:bg-red-300 transition duration-200 ease-out"
                >
                  <XIcon className="h-7" />
                </button>
                <img
                  className="max-w-[300px] border border-slate-700 rounded-md"
                  src={imagePreviewSrc}
                />
              </div>
            ) : (
              <div
                className="flex my-4 self-center max-w-min cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                <PhotographIcon className="w-[200px] animate-pulse" />
                <input
                  className="text-xs ml-8 w-1/2"
                  required
                  type="file"
                  name="photo"
                  id="photo"
                  onChange={(e) => showImagePreview(e)}
                  ref={imageInputRef}
                  hidden
                ></input>
              </div>
            )}
            {/* <div className="flex font-bold">
              <p>Name</p>
            </div> */}
            <input
              className="p-2 bg-transparent w-full text-sm sm:text-lg border border-slate-600 rounded outline-none"
              required
              type="text"
              placeholder="Name of Event"
              ref={nameInputRef}
            ></input>
            {/* <div className="flex font-bold">
              <p>Amount of Tickets</p>
            </div> */}
            {/* add date input here */}
            <input
              required
              className="p-2 bg-transparent border border-slate-600 text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Amount of Tickets"
              ref={amountOfTicketsInputRef}
            ></input>
            {/* <div className="flex font-bold">
              <p>Cost per Ticket</p>
            </div> */}
            <input
              required
              className="p-2 bg-transparent border border-slate-600 text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Cost per Ticket"
              ref={costPerTicketInputRef}
            ></input>
            {/* <div className="flex font-bold">
              <p>Describe the event</p>
            </div> */}
            <div className="flex overflow-y-scroll">
              <textarea
                required
                className="w-full bg-transparent outline-none p-2 text-sm sm:text-lg border border-slate-600 rounded min-h-[48px] max-h-36"
                placeholder="Description"
                form="eventCreate"
                ref={descriptionInputRef}
              ></textarea>
            </div>

            <button
              className={`font-bold p-2 sm:p-4 sm:max-w-[150px] bg-[#ff9531] rounded-md hover:bg-black hover:text-white transition duration-200 ease-out ${
                !session && "opacity-50 cursor-not-allowed"
              }}`}
              type="submit"
              disabled={!session}
            >
              Submit
            </button>
          </form>
          {/* {eventPlaced ? (
            <ConfirmEventCreation createEvent={createEvent} cancel={cancel} />
          ) : null} */}
        </div>
      </div>
    </>
  );
}
