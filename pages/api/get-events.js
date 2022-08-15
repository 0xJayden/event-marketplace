import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  const client = await MongoClient.connect(
    `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
  );

  const db = client.db();

  const eventsCollection = db.collection("events");

  const events = await eventsCollection.find().toArray();

  client.close();

  res.status(200).json({ events });
};

export default handler;
