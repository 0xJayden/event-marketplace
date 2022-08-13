import useSWR from "swr";

export default function getEventData() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR(
    "http://localhost:3000/api/get-events",
    fetcher
  );

  return {
    data,
    error,
  };
}
