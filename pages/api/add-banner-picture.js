import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const account = data.account;
    const banner = data.bannerImage;
    console.log(data);

    const client = await MongoClient.connect(
      `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
    );
    const db = client.db();

    const eventsCollection = db.collection("profiles");

    const result = await eventsCollection.updateOne(
      { account: { $eq: account } },
      { $set: { banner: banner } },
      {
        upsert: true,
      }
    );

    client.close();

    res.status(201).json({ message: "Profile picture added." });
  }
};

export default handler;
