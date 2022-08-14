import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  const client = await MongoClient.connect(process.env.DB_URI);
  const db = client.db();

  const profilesCollection = db.collection("profiles");

  const profiles = await profilesCollection.find().toArray();

  client.close();

  res.status(200).json({ profiles });
};

export default handler;
