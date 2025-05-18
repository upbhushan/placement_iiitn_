import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("⚠️ MONGODB_URI is missing in .env.local");

const client = new MongoClient(uri);
export const db = client.db("IIITN");
    