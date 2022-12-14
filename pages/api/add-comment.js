import { MongoClient } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const name = data.eventName;
    const comment = data.comment;
    const account = data.account;
    console.log(data);

    const client = await MongoClient.connect(
      `mongodb+srv://jay:${process.env.DB_PASS}@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority`
    );
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
