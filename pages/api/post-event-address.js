import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "PUT") {
    const data = req.body;
    const name = data.name;
    const address = data.address;
    console.log(data);
    const client = await MongoClient.connect(process.env.DB_URI);
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { name: { $eq: name } },
      { $set: { address: address } }
    );
    res.status(201).json({ message: "Event address added to document." });
  }
};

export default handler;
