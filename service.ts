import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { games?: mongoDB.Collection, users?: mongoDB.Collection } = {}

export async function connectToDatabase () {
    dotenv.config();
    const client: mongoDB.MongoClient = new mongoDB.MongoClient("mongodb://localhost:27017");         
    await client.connect();   
    const db: mongoDB.Db = client.db("steam");
    const gamesCollection: mongoDB.Collection = db.collection("games");
    collections.games = gamesCollection;
    const usersCollection: mongoDB.Collection = db.collection("users");
    collections.users = usersCollection; 
    console.log(`Successfully connected to database: ${db.databaseName} and collections`);
 }