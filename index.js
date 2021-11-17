const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdc0b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Kastell");
    const servicesCollection = database.collection("services");
    const productsCollection = database.collection("products");
    const apartmentCollection = database.collection("apartment");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

    //Apartment
    app.get("/apartment", async (req, res) => {
      const cursor = apartmentCollection.find({});
      const apartment = await cursor.toArray();
      res.send(apartment);
    });

    //Review get
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    //Review Post
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // AllUsers get Api

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    // Get Api
    app.get("/services", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //Get Products Api
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // Post Api

    app.post("/services", async (req, res) => {
      const service = req.body;

      console.log("hit the post Api", service);

      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.send(result);
    });

    //Users Post Api

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //Users Put Api
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //Admin

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Delete services Api
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      console.log("deleting user id", result);
      res.json(result);
    });
  } finally {
    //await clint.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running");
});
app.listen(port, () => {
  console.log("Running or not", port);
});
