import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "DELETE") {
    const data = req.body;
    const name = data.name;
    const account = data.account;
    console.log(data);

    const client = await MongoClient.connect(
      `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
    );
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
