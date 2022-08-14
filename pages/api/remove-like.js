import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "DELETE") {
    const data = req.body;
    const name = data.name;
    const account = data.account;
    console.log(data);

    const client = await MongoClient.connect(process.env.DB_URI);
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { name: name },
      { $pull: { likes: { account: account } } }
    );
    res.status(201).json({ message: "Like removed." });
  }
};

export default handler;
