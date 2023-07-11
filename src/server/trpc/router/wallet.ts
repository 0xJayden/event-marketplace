import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const walletRouter = router({
  create: publicProcedure
    .input(
      z.object({
        address: z.string(),
        publicKey: z.string(),
        privateKey: z.string(),
        mnemonic: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.wallet.create({
        data: {
          address: input.address,
          publicKey: input.publicKey,
          privateKey: input.privateKey,
          mnemonic: input.mnemonic,
          user: {
            connect: {
              id: ctx.session?.user?.id,
            },
          },
        },
      });

      return { address: input.address };
    }),

  get: publicProcedure.query(async ({ ctx }) => {
    const wallet = await ctx.prisma.wallet.findFirst({
      where: {
        userId: ctx.session?.user?.id,
      },
    });

    if (!wallet) return { error: "no wallet found" };

    return { address: wallet?.address };
  }),
});
