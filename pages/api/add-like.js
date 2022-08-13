import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const name = data.name;
    const account = data.account;
    console.log(data);

    const client = await MongoClient.connect(
      "mongodb+srv://jay:8614@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority"
    );
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { name: name },
      { $push: { likes: { account: account } } }
    );
    res.status(201).json({ message: "Like added." });
  }
};

export default handler;
