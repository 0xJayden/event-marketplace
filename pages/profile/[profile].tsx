import Web3 from "web3";
import { useState, useEffect, useRef, BaseSyntheticEvent } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import CreatedEvent from "../../abis/Event.json";
import { AbiItem } from "web3-utils";
import GetEventData from "../../components/get-event-data";
import { PencilIcon, UserIcon } from "@heroicons/react/outline";

export default function Profile() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");
  const [balances, setBalances] = useState<Array<{}>>();
  const [pfp, setPfp] = useState<string>();
  const [banner, setBanner] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const { data, error } = GetEventData();

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

  const loadBalances = async () => {
    setLoading(true);
    let newBalances: Array<{}> = [];

    try {
      if (web3)
        data?.events.map(async (e: any) => {
          let newEvent = new web3.eth.Contract(
            CreatedEvent.abi as AbiItem[],
            e.address
          );

          let balance = await newEvent.methods.balanceOf(account, 0).call();
          if (balance > 0) {
            newBalances.push(e);
            setBalances(newBalances);
          }
        });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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

  const setProfilePicture = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", async (e) => {
      if (
        e.target == null ||
        e.target.result == null ||
        typeof e.target.result !== "string"
      )
        return;
      setPfp(e.target.result);
      const body = {
        pfpImage: e.target.result,
        account: account,
      };
      await fetch("../api/add-profile-picture", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log("Success:", data));
    });
  };

  const setBannerPicture = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", async (e) => {
      if (
        e.target == null ||
        e.target.result == null ||
        typeof e.target.result !== "string"
      )
        return;
      setBanner(e.target.result);
      const body = {
        bannerImage: e.target.result,
        account: account,
      };
      await fetch("../api/add-banner-picture", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => console.log("Success:", data));
    });
  };

  const loadProfileInfo = async () => {
    const result = await fetch("../api/get-profiles").then((res) => res.json());

    const profile = await result.profiles.find(
      (res: any) => res.account === account
    );
    setPfp(profile?.pfp);
    setBanner(profile?.banner);
  };

  useEffect(() => {
    loadWeb3();
    loadBalances();
    loadProfileInfo();
  }, [account, data]);

  return (
    <>
      <div className="flex justify-center w-full">
        <Navbar data={data} account={account} web3Handler={web3Handler} />
      </div>
      <div className="flex justify-center w-full">
        <div className="relative sm:w-5/6 sm:max-w-[1000px]">
          <div
            onClick={() => bannerImageInputRef.current?.click()}
            className={`h-[100px] overflow-hidden sm:h-[200px] w-full bg-gray-100 cursor-pointer hover:opacity-70`}
          >
            <input
              className="text-xs ml-8 w-1/2"
              required
              type="file"
              name="photo"
              id="photo"
              onChange={setBannerPicture}
              ref={bannerImageInputRef}
              hidden
            ></input>
            {banner ? (
              <img src={banner} />
            ) : (
              <div className="flex h-full justify-center items-center opacity-0 hover:opacity-100">
                <PencilIcon className="h-7 text-gray-500" />
              </div>
            )}
          </div>
          <div
            onClick={() => imageInputRef.current?.click()}
            className="absolute overflow-hidden shadow-md bg-white top-[60px] sm:top-[120px] ml-4 h-[90px] sm:h-[125px] w-[90px] sm:w-[125px] rounded-full border cursor-pointer hover:opacity-70"
          >
            <input
              className="text-xs ml-8 w-1/2"
              required
              type="file"
              name="photo"
              id="photo"
              onChange={setProfilePicture}
              ref={imageInputRef}
              hidden
            ></input>
            {pfp ? (
              <img src={pfp} />
            ) : (
              <div className="flex h-full justify-center items-center">
                <UserIcon className="h-20 text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-20 ml-4 max-w-[200px]">
            <p className="text-xl font-bold overflow-hidden text-ellipsis hover:underline cursor-pointer">
              {account}
            </p>
          </div>
          <div className="mx-4 mt-10 border-b">
            <p className="font-semibold underline underline-offset-4">
              Tickets
            </p>
          </div>
          <div className="grid gap-2 sm:gap-4 grid-cols-2 m-4 justify-center items-center">
            {balances ? (
              balances.map((e: any) => (
                <div
                  onClick={() => router.push(`../events/${e.name}`)}
                  key={e.name}
                  className="flex flex-col justify-center shadow-md rounded w-full cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                >
                  <div className="p-2">{e.name}</div>
                  <img src={e.image} />
                </div>
              ))
            ) : isLoading ? (
              <div className="flex h-[350px] justify-center items-center">
                <div
                  className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <p>No purchased tickets yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
