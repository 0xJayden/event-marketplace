import useSWR from "swr";

export default function GetEventData() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR(
    "http://event-marketplace.vercel.app/api/get-events",
    fetcher
  );

  return {
    data,
    error,
  };
}
