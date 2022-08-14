import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const name = data.eventName;
    const comment = data.comment;
    const account = data.account;
    console.log(data);

    const client = await MongoClient.connect(process.env.DB_URI);
    const db = client.db();

    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { name: name },
      { $push: { comments: { account: account, comment: comment } } }
    );
    res.status(201).json({ message: "Comment added." });
  }
};

export default handler;
