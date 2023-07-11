import { ethers } from "ethers";
import { GetServerSidePropsContext } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  LiteralUnion,
  getProviders,
  signIn,
} from "next-auth/react";
import { Cairo } from "next/font/google";
import { FormEvent, useRef } from "react";

const cairo = Cairo({ subsets: ["latin"] });

export default function SignIn({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  const emailRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    const emailInput = emailRef.current?.value;

    if (!emailInput) return;

    await signIn("email", {
      email: emailInput,
      callbackUrl: "/",
    });
  };

  return (
    <div
      style={cairo.style}
      className="inset-0 fixed flex flex-col items-center space-y-5 justify-center bg-slate-700 text-slate-200 "
    >
      <h1 className="text-transparent bg-gradient-to-r bg-clip-text drop-shadow from-[#ff9531] to-[#ffd29e] text-center font-semibold text-[50px]">
        Socialize
      </h1>
      <p>Sign in to continue.</p>
      <div className="flex flex-col justify-center border border-[#ff9531] w-[300px] rounded p-4">
        <form onSubmit={submitHandler} className="flex flex-col space-y-2">
          <input
            className="rounded outline-none placeholder:text-slate-400 bg-transparent border border-slate-800 px-2 py-1 text-slate-200"
            type="text"
            placeholder="email@example.com"
            ref={emailRef}
          />
          <button
            type="submit"
            className="border bg-slate-800 border-slate-800 px-2 py-1 rounded"
          >
            Sign in with Email
          </button>
        </form>
        <div className="flex justify-between my-4 w-full">
          <div className="text-[#ff9531]">-------------</div>
          <p>or</p>
          <div className="text-[#ff9531]">-------------</div>
        </div>
        <div className="space-y-2 flex flex-col">
          {providers
            ? Object.values(providers).map(
                (p) =>
                  p.name !== "Email" && (
                    <button
                      key={p.id}
                      onClick={async () =>
                        await signIn(p.id, { callbackUrl: "/" })
                      }
                      className="border rounded bg-slate-800 border-slate-800 px-2 py-1"
                    >
                      Sign in with {p.name}
                    </button>
                  )
              )
            : "oops"}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
};
