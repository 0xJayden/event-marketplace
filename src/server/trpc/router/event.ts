import { z } from "zod";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { tmpdir } from "os";

import { publicProcedure, router } from "../trpc";

export const eventRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const event = await ctx.prisma.event.findUnique({
      where: {
        id: input,
      },
      include: {
        likes: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!event) return { error: "no event found" };

    return { event };
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      include: {
        likes: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!events) return { error: "no events found" };

    return { events: events };
  }),
  comment: publicProcedure

    .input(
      z.object({
        eventId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;

      if (!user) return { error: "not logged in" };

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.eventId,
        },
      });

      if (!event) return { error: "no event found" };

      await ctx.prisma.comment.create({
        data: {
          event: {
            connect: {
              id: input.eventId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          text: input.comment,
          pfp: user.image,
          author: user.name ? user.name : user.email ? user.email : "unknown",
        },
      });

      return { msg: "comment created" };
    }),
  likeEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;

      if (!user) return { error: "not logged in" };

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.eventId,
        },
        include: {
          likes: true,
        },
      });

      if (!event) return { error: "no event found" };

      const likeExists = event.likes.find((like) => like.userId === user.id);

      if (likeExists) {
        await ctx.prisma.like.delete({
          where: {
            id: likeExists.id,
          },
        });

        return { event };
      } else {
        const like = await ctx.prisma.like.create({
          data: {
            event: {
              connect: {
                id: input.eventId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        console.log(event, "event");
        console.log(like, "like");

        return { event };
      }
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        amountOfTickets: z.number(),
        pricePerTicket: z.number(),
        description: z.string(),
        image: z.any(),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) return { error: "not logged in" };

      // const dirname = __dirname;

      // const fileName = dirname + "/" + input.name + ".jpeg";

      const fileName = tmpdir() + "/" + input.name + ".jpeg";

      // stripping metadata from base64
      const matches = input.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      const buffer = Buffer.from(matches[2], "base64");

      // save image to server
      fs.writeFile(fileName, buffer, (err) => {
        if (err) {
          console.log(err, "error");
          return { error: "error saving image" };
        }
        console.log("file saved");
      });

      // post image & json metadata to pinata with formdata
      const body = new FormData();
      body.append("file", fs.createReadStream(fileName));
      console.log("after");

      try {
        const result = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          body,
          {
            headers: {
              "Content-Type": `multipart/form-data; boundary=${body.getBoundary()}`,
              pinata_api_key: process.env.PINATA_API_KEY
                ? process.env.PINATA_API_KEY
                : "",
              pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
                ? process.env.PINATA_SECRET_API_KEY
                : "",
            },
          }
        );

        // const jsonBody = JSON.stringify({
        //   pinataMetadata: {
        //     name: input.name + ".json",
        //   },
        //   pinataContent: {
        //     name: input.name,
        //     image: "ipfs://" + result.data.IpfsHash,
        //   },
        // });

        // const jsonUpload = await axios.post(
        //   "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        //   jsonBody,
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       pinata_api_key: process.env.PINATA_API_KEY
        //         ? process.env.PINATA_API_KEY
        //         : "",
        //       pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
        //         ? process.env.PINATA_SECRET_API_KEY
        //         : "",
        //     },
        //   }
        // );

        const cid = result.data.IpfsHash;

        const event = await ctx.prisma.event.create({
          data: {
            name: input.name,
            createdBy: input.createdBy,
            amountOfTickets: input.amountOfTickets,
            price: input.pricePerTicket,
            description: input.description,
            cid,
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });

        if (!event) return { error: "event not created" };

        // delete image from server
        fs.rm(fileName, (err) => {
          if (err) {
            console.log(err, "error");
            return { error: "error deleting image" };
          }
          console.log("file deleted");
        });

        return {
          msg: "event created",
          event,
        };
      } catch (err) {
        console.log("response error", err);

        fs.rm(fileName, (err) => {
          if (err) {
            console.log(err, "error");
            return { error: "error deleting image" };
          }
          console.log("file deleted");
        });
        return {
          err,
        };
      }
    }),
});
