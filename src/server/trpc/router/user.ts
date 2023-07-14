import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import fs from "fs";
import axios from "axios";
import { tmpdir } from "os";
import FormData from "form-data";

export const userRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany();

    if (!users) return { error: "no users found" };

    return { users };
  }),
  getUserWithLikes: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // const user = ctx.session?.user;

      // if (!user) return { error: "not logged in" };

      // const isMe = user.id === input;

      if (input === "null") {
        return { error: "no user found" };
      }

      const userWithLikes = await ctx.prisma.user.findUnique({
        where: {
          id: input,
        },
        include: {
          likes: true,
          followers: true,
          following: true,
        },
      });

      return { userWithLikes };
    }),
  getUserWithEvents: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // const user = ctx.session?.user;

      // if (!user) return { error: "not logged in" };

      const userWithEvents = await ctx.prisma.user.findUnique({
        where: {
          id: input,
        },
        include: {
          events: true,
          followers: true,
          following: true,
        },
      });

      return { userWithEvents };
    }),
  getUserWithTickets: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // const user = ctx.session?.user;

      // if (!user) return { error: "not logged in" };

      const userWithTickets = await ctx.prisma.user.findUnique({
        where: {
          id: input,
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
  follow: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const user = ctx.session?.user;

    if (!user) return { error: "not logged in" };

    const userToFollow = await ctx.prisma.user.findUnique({
      where: {
        id: input,
      },
    });

    if (!userToFollow) return { error: "user not found" };

    const userAlreadyFollows = await ctx.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        following: {
          where: {
            id: userToFollow.id,
          },
        },
      },
    });

    if (userAlreadyFollows?.following?.length) {
      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          following: {
            disconnect: {
              id: userToFollow.id,
            },
          },
        },
      });

      return { msg: "unfollowed" };

      //   await ctx.prisma.user.update({
      //     where: {
      //         id: userToFollow.id,
      //     },
      //     data: {
      //         followers: {
      //             disconnect: {
      //                 id: user.id
      //             }
      //         }
      //     }

      //   })
    }

    const userWithFollowing = await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          connect: {
            id: userToFollow.id,
          },
        },
      },
    });

    return { msg: "followed" };
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
