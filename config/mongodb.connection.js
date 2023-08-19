import { MongoClient, ServerApiVersion } from "mongodb";
import dbconfig from "../config/config.js";

let client = null;

const connectToDB = async () => {
  if (!client) {
    try {
      client = new MongoClient(dbconfig.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      console.log("Connected to MongoDB!");
    } catch (err) {
      console.log("Error connecting to MongoDB:", err);
    }
  }
};

const closeDB = async () => {
  if (client) {
    try {
      await client.close();
      console.log("MongoDB connection closed!");
    } catch (err) {
      console.log("Error closing MongoDB connection:", err);
    } finally {
      client = null;
    }
  }
};

const getClient = () => client;

export { getClient, closeDB, connectToDB };

