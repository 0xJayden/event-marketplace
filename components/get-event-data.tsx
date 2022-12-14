import useSWR from "swr";

export default function GetEventData() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error } = useSWR("/api/get-events", fetcher, {
    refreshInterval: 1000,
  });

  return {
    data,
    error,
  };
}
