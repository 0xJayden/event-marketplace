import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  const client = await MongoClient.connect(
    `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
  );
  const db = client.db();

  const profilesCollection = db.collection("profiles");

  const profiles = await profilesCollection.find().toArray();

  client.close();

  res.status(200).json({ profiles });
};

export default handler;
