const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function getCollection() {
  await client.connect();
  const db = client.db("lostserumDB");
  return db.collection("gameStates");
}

module.exports = getCollection;

