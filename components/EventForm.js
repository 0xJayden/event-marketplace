import { useRef, useState } from "react";

export default function EventForm(submitHandler) {
  const nameInputRef = useRef();
  const symbolInputRef = useRef();
  const imageInputRef = useRef();
  const amountOfTicketsInputRef = useRef();
  const costPerTicketInputRef = useRef();

  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

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

  return (
    <div className="card">
      <h1>Events</h1>
      <form onSubmit={submitHandler}>
        <input
          className="email-input"
          type="text"
          placeholder="Name"
          ref={nameInputRef}
        ></input>
        <input
          className="email-input"
          type="text"
          placeholder="Symbol"
          ref={symbolInputRef}
        ></input>
        <label>Image:</label>
        <input
          className="email-input"
          type="file"
          name="photo"
          id="photo"
          onChange={showImagePreview}
          ref={imageInputRef}
        ></input>
        {isImageSelected ? <img src={imagePreviewSrc} /> : "No image selected"}
        <button type="submit">Submit</button>
        <input
          className="email-input"
          type="text"
          placeholder="Amount of Tickets"
          ref={amountOfTicketsInputRef}
        ></input>
        <input
          className="email-input"
          type="text"
          placeholder="Cost per Ticket"
          ref={costPerTicketInputRef}
        ></input>
      </form>
    </div>
  );
}
