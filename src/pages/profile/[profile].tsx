import { useState, useEffect, useRef, BaseSyntheticEvent } from "react";
import { useRouter } from "next/router";
import { AbiItem } from "web3-utils";
import { PencilIcon, UserIcon } from "@heroicons/react/outline";
import { Cairo } from "next/font/google";

import CreatedEvent from "../../../abis/Event.json";
import Navbar from "../../components/Navbar";
import { useWeb3 } from "../../hooks/useWeb3";
import { useWallet } from "../../hooks/useWallet";
import { trpc } from "../../utils/trpc";
import { on } from "events";
import Image from "next/image";
import Compressor from "compressorjs";
import { tmpdir } from "os";
import { useSession } from "next-auth/react";
import { userAgent } from "next/server";

const cairo = Cairo({ subsets: ["latin"] });

export default function Profile() {
  const [balances, setBalances] = useState<Array<{}>>();
  const [pfp, setPfp] = useState<string>();
  const [banner, setBanner] = useState<string>();
  const [isLoading, setLoading] = useState(false);
  const [onTickets, setOnTickets] = useState(true);
  const [onEvents, setOnEvents] = useState(false);
  const [onLikes, setOnLikes] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const { data: session } = useSession();

  const { profile } = router.query;

  if (!profile) return null;

  const { account, web3 } = useWeb3();

  // const { address } = useWallet();

  const { data, refetch } = trpc.user.getUserWithTickets.useQuery(
    profile as string,
    {
      onSuccess: (data) => {
        setPfp("");
        setBanner("");
        if (data?.userWithTickets?.image) setPfp(data.userWithTickets.image);
        if (data.userWithTickets?.banner)
          setBanner(data.userWithTickets.banner);
      },
      onError: (err) => {
        console.log(err);
      },
      enabled: !!onTickets,
    }
  );

  const { data: events } = trpc.user.getUserWithEvents.useQuery(
    profile as string,
    {
      onSuccess: (data) => {
        if (data?.userWithEvents?.image) setPfp(data.userWithEvents.image);
      },
      onError: (err) => {
        console.log(err);
      },
      enabled: !!onEvents,
    }
  );

  const { data: likes } = trpc.user.getUserWithLikes.useQuery(
    profile as string,
    {
      onSuccess: (data) => {
        if (data?.userWithLikes?.image) setPfp(data.userWithLikes.image);
      },
      onError: (err) => {
        console.log(err);
      },
      enabled: !!onLikes,
    }
  );

  const uploadProfilePicture = trpc.user.uploadProfilePicture.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const uploadBanner = trpc.user.uploadBanner.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const follow = trpc.user.follow.useMutation({
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const followUser = () => {
    follow.mutate(profile as string);
  };

  // const compressImage = trpc.user.compressImage.useMutation()

  // const loadBalances = async () => {
  //   setLoading(true);
  //   let newBalances: Array<{}> = [];

  //   try {
  //     if (web3)
  //       data?.events.map(async (e: any) => {
  //         let newEvent = new web3.eth.Contract(
  //           CreatedEvent.abi as AbiItem[],
  //           e.address
  //         );

  //         let balance = await newEvent.methods.balanceOf(account, 0).call();
  //         if (balance > 0) {
  //           newBalances.push(e);
  //           setBalances(newBalances);
  //         }
  //       });
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const setProfilePicture = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    if (!image) return console.log("no image");
    if (!["image/jpeg", "image/png"].includes(image.type))
      return console.log("not an image");

    new Compressor(image, {
      quality: 0.8,
      width: 100,
      height: 100,
      resize: "cover",
      success(result) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(result);
        fileReader.addEventListener("load", async (e) => {
          if (
            e.target == null ||
            e.target.result == null ||
            typeof e.target.result !== "string"
          )
            return;
          setPfp(e.target.result);
          uploadProfilePicture.mutate(e.target.result);
        });
      },
    });
  };

  const setBannerPicture = (e: BaseSyntheticEvent) => {
    const image = e.target.files[0];
    if (!image) return;
    if (!["image/jpeg", "image/png"].includes(image.type)) return;

    new Compressor(image, {
      quality: 0.8,
      width: 400,
      height: 120,
      resize: "cover",
      success(result) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(result);
        fileReader.addEventListener("load", async (e) => {
          if (
            e.target == null ||
            e.target.result == null ||
            typeof e.target.result !== "string"
          )
            return;
          setBanner(e.target.result);
          uploadBanner.mutate(e.target.result);
        });
      },
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

  // useEffect(() => {
  //   loadWeb3();
  //   loadBalances();
  //   loadProfileInfo();
  // }, [account, data]);

  return (
    <>
      <div className="flex justify-center w-full">
        <Navbar />
      </div>
      <div
        style={cairo.style}
        className="flex text-slate-200 bg-slate-800 min-h-screen justify-center w-full"
      >
        <div className="relative w-full sm:w-5/6 sm:max-w-[1000px]">
          <div
            onClick={() => bannerImageInputRef.current?.click()}
            className={`h-[100px] overflow-hidden sm:h-[200px] ${
              !banner && "animate-pulse"
            } w-full bg-slate-600 cursor-pointer hover:opacity-70`}
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
              <Image alt="" width={400} height={100} src={banner} />
            ) : (
              <div className="flex h-full justify-center items-center">
                {/* <PencilIcon className="h-7 text-gray-200" /> */}
              </div>
            )}
          </div>
          <div
            onClick={() => imageInputRef.current?.click()}
            className="absolute overflow-hidden shadow-md bg-slate-700 border-slate-600 top-[60px] sm:top-[120px] ml-2 h-[90px] sm:h-[125px] w-[90px] sm:w-[125px] rounded-full border cursor-pointer hover:opacity-70"
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
              <Image src={pfp} alt="" width={100} height={100} />
            ) : (
              <div className="flex h-full justify-center items-center">
                <UserIcon className="h-20" />
              </div>
            )}
          </div>
          {profile === session?.user?.id ? (
            <button className="rounded-lg absolute right-5 mt-3 border border-slate-600 p-2">
              Edit Profile
            </button>
          ) : data?.userWithTickets?.followers.find(
              (f) => f.id === session?.user?.id
            ) ? (
            <button
              onClick={() => followUser()}
              className="rounded-lg absolute right-5 mt-3 border border-slate-600 p-2"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={() => followUser()}
              className="rounded-lg absolute right-5 mt-3 border border-slate-600 p-2"
            >
              Follow
            </button>
          )}
          <div className="mt-[55px] ml-4 max-w-[200px]">
            {/* <p className="text-xl font-bold overflow-hidden text-ellipsis hover:underline cursor-pointer">
              {account ? account : address}
            </p> */}
            <p className="text-2xl font-bold">{data?.userWithTickets?.name}</p>
          </div>
          {data?.userWithTickets?.bio ? (
            <p className="ml-4">{data.userWithTickets.bio}</p>
          ) : (
            <p className="text-slate-500 ml-4">No bio... boring.</p>
          )}
          <div className="flex space-x-2 ml-4 my-2">
            <p>{data?.userWithTickets?.following.length} Following</p>
            <p>{data?.userWithTickets?.followers.length} Followers</p>
          </div>
          <div className="mx-4 flex justify-between border-b border-b-slate-700">
            <p
              className={`w-fit cursor-pointer ${
                onTickets && "border-orange-500 border-b-2"
              }`}
              onClick={() => {
                setOnTickets(true);
                setOnEvents(false);
                setOnLikes(false);
              }}
            >
              Tickets
            </p>
            <p
              className={`w-fit cursor-pointer ${
                onEvents && "border-orange-500 border-b-2"
              }`}
              onClick={() => {
                setOnTickets(false);
                setOnEvents(true);
                setOnLikes(false);
              }}
            >
              Events
            </p>
            <p
              className={`w-fit cursor-pointer ${
                onLikes && "border-orange-500 border-b-2"
              }`}
              onClick={() => {
                setOnLikes(true);
                setOnEvents(false);
                setOnTickets(false);
              }}
            >
              Likes
            </p>
          </div>
          <div>
            {onTickets ? (
              <div className="grid gap-2 sm:gap-4 grid-cols-2 m-4 justify-center items-center">
                {data?.userWithTickets?.tickets &&
                data.userWithTickets.tickets.length > 0
                  ? data?.userWithTickets?.tickets.map((e: any) => (
                      <div
                        onClick={() => router.push(`../events/${e.eventId}`)}
                        key={e.id}
                        className="flex relative flex-col justify-center shadow-md rounded w-full cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                      >
                        <Image
                          className="rounded-lg"
                          alt=""
                          width={300}
                          height={200}
                          src={e.image}
                        />
                        <div className="absolute rounded-b-lg backdrop-brightness-50 w-full bottom-0 p-2">
                          {e.eventName}
                        </div>
                      </div>
                    ))
                  : "No Tickets yet."}
              </div>
            ) : onEvents ? (
              <div className="grid gap-2 sm:gap-4 grid-cols-2 m-4 justify-center items-center">
                {events?.userWithEvents?.events.map((e: any) => (
                  <div
                    onClick={() => router.push(`../events/${e.id}`)}
                    key={e.name}
                    className="flex relative flex-col justify-center shadow-md rounded-lg w-full cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                  >
                    <Image
                      alt=""
                      className="w-full rounded-lg h-full object-cover cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                      src={`https://gateway.pinata.cloud/ipfs/${e.cid}`}
                      width={300}
                      height={200}
                    />
                    <div className="absolute rounded-b-lg backdrop-brightness-50 w-full bottom-0 p-2">
                      {e.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : onLikes ? (
              <div className="grid gap-2 sm:gap-4 grid-cols-2 m-4 justify-center items-center">
                {likes?.userWithLikes?.likes.map((e: any) => (
                  <div
                    onClick={() => router.push(`../events/${e.name}`)}
                    key={e.id}
                    className="flex flex-col justify-center shadow-md rounded w-full cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
                  >
                    <div className="p-2">{e.id}</div>
                    <img src={e.image} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[350px] justify-center items-center">
                <div
                  className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
                  role="status"
                >
                  {/* <span className="visually-hidden">Loading...</span> */}
                </div>
              </div>
            )}
          </div>
          {/* <div className="grid gap-2 sm:gap-4 grid-cols-2 m-4 justify-center items-center">
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
          </div> */}
        </div>
      </div>
    </>
  );
}
