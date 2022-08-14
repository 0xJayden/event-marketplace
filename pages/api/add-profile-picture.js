import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const account = data.account;
    const pfp = data.pfpImage;
    console.log(data);

    const client = await MongoClient.connect(process.env.DB_URI);
    const db = client.db();

    const eventsCollection = db.collection("profiles");

    const result = await eventsCollection.updateOne(
      { account: account },
      { pfp: pfp }
    );
    res.status(201).json({ message: "Profile picture added." });
  }
};

export default handler;
