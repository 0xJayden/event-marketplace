import { RecoilRoot } from "recoil";
import { AppProps } from "next/app";
import { AppType } from "next/dist/shared/lib/utils";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";
import "../styles/globals.css";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
