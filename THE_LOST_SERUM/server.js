const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = 3000;
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
let db, sessions;

// Connect to MongoDB
async function initMongo() {
 await mongoClient.connect();
 db = mongoClient.db("The_Lost_Serum");
 sessions = db.collection("sessions");
 console.log("✅ Connected to MongoDB: The_Lost_Serum");
}

app.get("/", (req, res) => {
 res.send("Welcome to The Lost Serum Game API! Available endpoints: /results, /player/:name");
});

app.get("/results", async (req, res) => {
 const all = await sessions.find({}).sort({ time: -1 }).toArray();
 res.json(all);

});

app.get("/player/:name", async (req, res) => {

 const name = req.params.name;
 const result = await sessions.find({ player: { $regex: new RegExp(name, "i") } }).sort({ time: -1 }).toArray();
 res.json(result);

});

initMongo().then(() => {
 app.listen(PORT, () => console.log(`🚀 Express server running on http://localhost:${PORT}`));
});