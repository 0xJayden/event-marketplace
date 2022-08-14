import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "DELETE") {
    const name = req.body.name;
    console.log(name);

    const client = await MongoClient.connect(process.env.DB_URI);
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.deleteOne({ name: { $eq: name } });
    res.status(201).json({ message: "Event deleted." });
  }
};

export default handler;
