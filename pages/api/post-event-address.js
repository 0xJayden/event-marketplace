import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "PUT") {
    const data = req.body;
    const name = data.name;
    const address = data.address;
    console.log(data);
    const client = await MongoClient.connect(
      `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
    );
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { name: { $eq: name } },
      { $set: { address: address } }
    );

    client.close();

    res.status(201).json({ message: "Event address added to document." });
  }
};

export default handler;
