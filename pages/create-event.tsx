import { useRef, useState, useEffect, BaseSyntheticEvent } from "react";
import CreateEventAbi from "../abis/CreateEvent.json";
import Web3 from "web3";
import Loading from "../components/Loading";
import ConfirmEventCreation from "../components/ConfirmEventCreation";
import Cancelling from "../components/Cancelling";
import Confirming from "../components/Confirming";
import EventCreationSuccess from "../components/EventCreationSuccess";
import { PhotographIcon, XIcon } from "@heroicons/react/outline";
import Navbar from "../components/Navbar";
import { AbiItem } from "web3-utils";
import GetEventData from "../components/get-event-data";

export default function CreateEvent() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const amountOfTicketsInputRef = useRef<HTMLInputElement>(null);
  const costPerTicketInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");

  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const [image, setImage] = useState<string | Blob>("");
  const [eventPlaced, setEventPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadWeb3 = async () => {
    if (typeof window.ethereum !== "undefined" && !account) {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        console.log("please install metamask");
      }

      window.ethereum.on("accountsChanged", (accounts: Array<string>) => {
        setAccount(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId: number) => {
        window.location.reload();
      });
    } else {
      console.log("error");
    }
  };

  // to connect wallet/account with button
  const web3Handler = async () => {
    if (web3) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      console.log("Please install MetaMask.");
    }
  };

  const submitHandler = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const enteredName = nameInputRef.current?.value;
    const enteredAmountOfTickets = amountOfTicketsInputRef.current?.value;
    const enteredCostPerTicket = costPerTicketInputRef.current?.value;
    const enteredDescription = descriptionInputRef.current?.value;

    if (
      enteredName &&
      enteredAmountOfTickets &&
      enteredCostPerTicket &&
      enteredDescription
    ) {
      setEventName(enteredName);
      const body = new FormData();
      body.append("file", image);
      body.append("account", account);
      body.append("name", enteredName);
      body.append("image", imagePreviewSrc);
      body.append("amountOfTickets", enteredAmountOfTickets);
      body.append("costPerTicket", enteredCostPerTicket);
      body.append("description", enteredDescription);

      const res = await fetch("api/newEvent", {
        method: "POST",
        body,
      })
        .then(() => setIsLoading(false))
        .then(() => setEventPlaced(true));
    }
  };

  const showImagePreview = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    setImage(image);
    if (!image) return;
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
            .send({ from: account, value: 0 })
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

  useEffect(() => {
    loadWeb3();
  }, [account]);

  const { data, error } = GetEventData();

  return (
    <>
      <div className="flex justify-center w-full">
        <Navbar data={data} account={account} web3Handler={web3Handler} />
      </div>
      <div className="flex w-full justify-center">
        {isLoading ? <Loading /> : null}
        {cancelling ? <Cancelling /> : null}
        {confirming ? <Confirming /> : null}
        {success ? <EventCreationSuccess setSuccess={setSuccess} /> : null}
        <div className="flex my-4 flex-col items-center w-5/6 sm:max-w-[1000px]">
          <div className="flex items-start w-5/6 sm:w-auto">
            <h1 className="text-4xl font-bold my-4">Create Event</h1>
          </div>
          <div className="flex items-start w-5/6 sm:w-auto text-sm mb-4">
            <p>
              <span className=" text-red-500">*</span> Required Fields
            </p>
          </div>

          <form
            className="flex space-y-2 flex-col w-full"
            onSubmit={submitHandler}
            id="eventCreate"
          >
            <div className="flex">
              <p>Name</p>
              <span className=" text-red-500 ml-1">*</span>
            </div>
            <input
              className="p-2 w-full text-sm sm:text-lg border rounded outline-none"
              required
              type="text"
              placeholder="Name of Event"
              ref={nameInputRef}
            ></input>
            <div className="flex">
              <p>Amount of Tickets</p>
              <span className=" text-red-500 ml-1">*</span>
            </div>

            <input
              required
              className="p-2 border text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Amount"
              ref={amountOfTicketsInputRef}
            ></input>
            <div className="flex">
              <p>Cost per Ticket</p>
              <span className=" text-red-500 ml-1">*</span>
            </div>
            <input
              required
              className="p-2 border text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Cost"
              ref={costPerTicketInputRef}
            ></input>
            <div className="flex">
              <p>Select Image</p>
              <span className=" text-red-500 ml-1">*</span>
            </div>
            <div
              className="flex my-4 max-w-min cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              <PhotographIcon className="h-7" />
              <input
                className="text-xs ml-8 w-1/2"
                required
                type="file"
                name="photo"
                id="photo"
                onChange={showImagePreview}
                ref={imageInputRef}
                hidden
              ></input>
            </div>
            {isImageSelected ? (
              <div className="relative flex justify-center">
                <button
                  onClick={() => {
                    setIsImageSelected(!isImageSelected);
                  }}
                  className="absolute flex justify-center items-center left-20 sm:left-[420px] rounded-full w-8 h-8 cursor-pointer opacity-75 hover:bg-red-300 transition duration-200 ease-out"
                >
                  <XIcon className="h-5" />
                </button>
                <img
                  className="max-w-[150px] border rounded-md"
                  src={imagePreviewSrc}
                />
              </div>
            ) : null}
            <div className="flex">
              <p>Describe the event</p>
              <span className=" text-red-500 ml-1">*</span>
            </div>
            <div className="flex overflow-y-scroll">
              <textarea
                required
                className="w-full outline-none p-2 text-sm sm:text-lg border rounded min-h-[48px] max-h-36"
                placeholder="Description"
                form="eventCreate"
                ref={descriptionInputRef}
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                className="p-2 sm:p-4 border-2 w-1/4 sm:max-w-[150px] border-black rounded-md hover:bg-black hover:text-white transition duration-200 ease-out"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
          {eventPlaced ? (
            <ConfirmEventCreation createEvent={createEvent} cancel={cancel} />
          ) : null}
        </div>
      </div>
    </>
  );
}
