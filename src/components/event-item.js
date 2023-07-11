export default function EventItem({ image }) {
  return (
    <ul className="shadow-md mb-4 rounded-full shrink-0 w-16 sm:h-auto">
      <li className="flex">
        <img className="rounded-full" src={image} />
      </li>
    </ul>
  );
}
