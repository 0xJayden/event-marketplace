import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;

    if (!user) return { error: "not logged in" };

    const userWithLikes = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        likes: true,
      },
    });

    return { userWithLikes };
  }),
});
