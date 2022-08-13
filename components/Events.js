import { useRef, useState, useEffect } from "react";
// import { eventState } from "../atoms/modalAtom";
import getEventData from "./get-event-data";
import Loading from "./Loading";
import ConfirmEventCreation from "./ConfirmEventCreation";
import Cancelling from "./Cancelling";
import Confirming from "./Confirming";
import EventCreationSuccess from "./EventCreationSuccess";
import { PhotographIcon, XIcon } from "@heroicons/react/outline";

export default function Events({ event, account, setOpenCreateEvent }) {
  const nameInputRef = useRef();
  const amountOfTicketsInputRef = useRef();
  const costPerTicketInputRef = useRef();
  const descriptionInputRef = useRef();
  const imageInputRef = useRef();

  // const [event, setEvent] = useRecoilState(eventState);

  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [eventPlaced, setEventPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState("fakeName");
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const enteredName = nameInputRef.current.value;
    setEventName(enteredName);
    const enteredAmountOfTickets = amountOfTicketsInputRef.current.value;
    const enteredCostPerTicket = costPerTicketInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;

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
  };

  const showImagePreview = (e) => {
    const image = e.target.files[0];
    setImage(image);
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", (e) => {
      setImagePreviewSrc(e.target.result);
      setIsImageSelected(true);
    });
  };

  const createEvent = async () => {
    setConfirming(true);
    const result = await fetch("api/get-events").then((res) => res.json());

    for (let i = 0; result.events.length > i; i++) {
      if (result.events[i].name === eventName) {
        await event.methods
          .create(
            result.events[i].name,
            result.events[i].cid,
            result.events[i].amountOfTickets,
            result.events[i].costPerTicket
          )
          .send({ from: account, value: 0 })
          .on("confirmation", async (confirmationNumber, receipt) => {
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
          });
      } else {
        console.log("no matching events");
      }
      setEventPlaced(false);
    }
  };

  const cancel = async () => {
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

  const { data, error } = getEventData();
  if (error) return "error";

  return (
    <div>
      {isLoading ? <Loading /> : null}
      {cancelling ? <Cancelling /> : null}
      {confirming ? <Confirming /> : null}
      {success ? (
        <EventCreationSuccess
          setSuccess={setSuccess}
          setOpenCreateEvent={setOpenCreateEvent}
        />
      ) : null}
      <div className="flex fixed top-[60px] bottom-0 left-0 right-0 bg-white flex-col items-center">
        <h1 className="text-md my-4">Create Event</h1>
        <form
          className="flex space-y-4 flex-col w-5/6 max-w-[1000px]"
          onSubmit={submitHandler}
          id="eventCreate"
        >
          <div className="flex">
            <input
              className="p-4 w-full text-sm sm:text-lg border rounded outline-none"
              required
              type="text"
              placeholder="Name"
              ref={nameInputRef}
            ></input>
          </div>
          <div className="flex space-x-4">
            <input
              required
              className="p-4 w-1/2 border text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Amount of Tickets"
              ref={amountOfTicketsInputRef}
            ></input>
            <input
              required
              className="p-4 w-1/2 border text-sm sm:text-lg rounded outline-none"
              type="text"
              placeholder="Cost per Ticket"
              ref={costPerTicketInputRef}
            ></input>
          </div>
          <div
            className="flex my-4 max-w-min cursor-pointer"
            onClick={() => imageInputRef.current.click()}
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
  );
}
