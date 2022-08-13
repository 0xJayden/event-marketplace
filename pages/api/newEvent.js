import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { IncomingForm } from "formidable";
import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    // get image url
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return console.log(err);
      // console.log(fields, files);
      //   console.log(files.file.filepath);
      var oldPath = files.file.filepath;

      var info = fields;
      info.time = Date();

      // new form data with image url
      const body = new FormData();
      body.append("file", fs.createReadStream(oldPath));

      // post image to pinata with formdata
      try {
        const result = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          body,
          {
            headers: {
              ...body.getHeaders(),
              pinata_api_key: "5aef2b1a41bd1e3d2a8a",
              pinata_secret_api_key:
                "9c0571afea4992446f4adf836b41785fa85b5a8e5a68e6757d208c839f315ed0",
            },
          }
        );
        // console.log(result.data.IpfsHash);

        info.cid = result.data.IpfsHash;

        const jsonBody = JSON.stringify({
          pinataMetadata: {
            name: info.name + ".json",
          },
          pinataContent: {
            name: info.name,
            image: "ipfs://" + info.cid,
          },
        });

        const jsonUpload = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          jsonBody,
          {
            headers: {
              "Content-Type": "application/json",
              pinata_api_key: "5aef2b1a41bd1e3d2a8a",
              pinata_secret_api_key:
                "9c0571afea4992446f4adf836b41785fa85b5a8e5a68e6757d208c839f315ed0",
            },
          }
        );

        // store cid from pinata result in database
        const client = await MongoClient.connect(
          "mongodb+srv://jay:8614@cluster0.i6d1y.mongodb.net/?retryWrites=true&w=majority"
        );
        const db = client.db();

        const eventsCollection = db.collection("events");

        const result2 = await eventsCollection.insertOne(info);
        console.log(result2);
        client.close();
        res.status(201).json({ message: "eventAdded" });
      } catch (err) {
        if (err.response) {
          console.log("response error", err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          console.log("request error", err.request);
        } else {
          console.log("error", err.message);
        }
      }
    });
  }
};

export default handler;
