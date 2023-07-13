import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import fs from "fs";
import axios from "axios";
import { tmpdir } from "os";
import FormData from "form-data";

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
  uploadBanner: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;

      if (!user) return { error: "not logged in" };

      const userHasBanner = await ctx.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          image: true,
        },
      });

      if (userHasBanner?.image) {
        try {
          await axios.delete(
            `https://api.pinata.cloud/pinning/unpin/${userHasBanner.image.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            )}}`,
            {
              headers: {
                pinata_api_key: process.env.PINATA_API_KEY
                  ? process.env.PINATA_API_KEY
                  : "",
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
                  ? process.env.PINATA_SECRET_API_KEY
                  : "",
              },
            }
          );
          console.log("deleted pfp");
        } catch (error) {
          console.log(error, "error");
        }
      }

      const fileName = tmpdir() + "/" + user.name + "Banner" + ".jpeg";

      // stripping metadata from base64
      const matches = input.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (matches?.length !== 3) return { error: "error parsing image" };

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

        const cid = result.data.IpfsHash;

        const userWithBanner = await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            banner: `https://gateway.pinata.cloud/ipfs/${cid}`,
          },
        });

        return { userWithBanner };
      } catch (error) {
        console.log(error, "error");
        return { error: "error uploading image" };
      }
    }),
  uploadProfilePicture: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;

      if (!user) return { error: "not logged in" };

      const userHasProfilePicture = await ctx.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          image: true,
        },
      });

      if (userHasProfilePicture?.image) {
        try {
          await axios.delete(
            `https://api.pinata.cloud/pinning/unpin/${userHasProfilePicture.image.replace(
              "https://gateway.pinata.cloud/ipfs/",
              ""
            )}}`,
            {
              headers: {
                pinata_api_key: process.env.PINATA_API_KEY
                  ? process.env.PINATA_API_KEY
                  : "",
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
                  ? process.env.PINATA_SECRET_API_KEY
                  : "",
              },
            }
          );
          console.log("deleted pfp");
        } catch (error) {
          console.log(error, "error");
        }
      }

      // const dirname = __dirname;

      //   const fileName = dirname + "/" + input.name + ".jpeg";

      const fileName = tmpdir() + "/" + user.name + ".jpeg";

      // stripping metadata from base64
      const matches = input.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (matches?.length !== 3) return { error: "error parsing image" };

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

        const cid = result.data.IpfsHash;

        const userWithProfilePicture = await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            image: `https://gateway.pinata.cloud/ipfs/${cid}`,
          },
        });

        return { userWithProfilePicture };
      } catch (error) {
        console.log(error, "error");
        return { error: "error uploading image" };
      }
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
