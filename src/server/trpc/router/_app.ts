import { router } from "../trpc";
import { eventRouter } from "./event";
import { userRouter } from "./user";
import { walletRouter } from "./wallet";

export const appRouter = router({
  event: eventRouter,
  wallet: walletRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
