import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  getUserWithLikes: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;

    if (!user) return { error: "not logged in" };

    const userWithLikes = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        likes: true,
        followers: true,
        following: true,
      },
    });

    return { userWithLikes };
  }),
  getUserWithEvents: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;

    if (!user) return { error: "not logged in" };

    const userWithEvents = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        events: true,
        followers: true,
        following: true,
      },
    });

    return { userWithEvents };
  }),
  getUserWithTickets: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;

    if (!user) return { error: "not logged in" };

    const userWithTickets = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        tickets: true,
        followers: true,
        following: true,
      },
    });

    return { userWithTickets };
  }),
  //   getUserWithEverything: publicProcedure.query(async ({ ctx }) => {
  //     const user = ctx.session?.user;

  //     if (!user) return { error: "not logged in" };

  //     const userWithEverything = await ctx.prisma.user.findUnique({
  //       where: {
  //         id: user.id,
  //       },
  //       include: {
  //         likes: true,

  //       },
  //     });

  //     return { userWithEverything };
  //   }
});
