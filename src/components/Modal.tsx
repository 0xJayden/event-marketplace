import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRecoilState } from "recoil";
import { modalState, eventNameState, eventPage } from "../../atoms/modalAtom";

export default function Modal() {
  const [openModal, setOpenModal] = useRecoilState(modalState);
  const [eventName, setEventName] = useRecoilState(eventNameState);
  const [isEventPage, setEventPage] = useRecoilState(eventPage);

  const [comment, setComment] = useState("");

  const sendComment = async (e: any) => {
    e.preventDefault();

    const body = {
      eventName,
      // account,
      comment,
    };

    if (isEventPage) {
      await fetch("../api/add-comment", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
      setOpenModal(false);
    } else {
      await fetch("api/add-comment", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
      setOpenModal(false);
    }
  };

  return (
    <Transition
      show={openModal}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
      as={Fragment}
    >
      <Dialog className="relative z-50" onClose={() => setOpenModal(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-[#353950] bg-opacity-60 backdrop-blur transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="flex flex-col mx-auto max-w-sm rounded bg-slate-700 h-[180px] py-2 w-[300px]">
            <Dialog.Title className="text-white text-xl pb-2 self-center">
              Add Comment
            </Dialog.Title>
            <div className="flex flex-col items-center w-full pb-2">
              <textarea
                value={comment}
                className="w-5/6 min-h-[75px] text-white bg-transparent outline-none p-2 max-h-[100px] border border-slate-600 rounded"
                placeholder="What's up?"
                autoFocus
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <div className="flex w-5/6 pt-3">
                <button
                  onClick={sendComment}
                  type="submit"
                  disabled={!comment.trim()}
                  className="w-full rounded bg-orange-500 text-white py-1 px-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
