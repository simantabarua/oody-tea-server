const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.y6v6p.mongodb.net/ooty-db?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("ooty-db");
    const products_Collection = database.collection("products");
    const Order_Collection = database.collection("orders");
    console.log('database connect');

    // load products get api
    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = req.query.page;
      const cursor = products_Collection.find({});
      const count = await cursor.count();
      let products;

      if (size && page) {
        products = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }
      res.json({ count, products });
    });

    // load single product get api
    app.get("/SingleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await products_Collection.findOne(query);
      res.json(product);
    });

    // add product 
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await products_Collection.insertOne(product);
      res.json(result);
    });

    // update product
    app.patch('/update/:id', (req, res) => {
      productCollection.updateOne({ _id: ObjectId(req.params.id) },
        {
          $set: { price: req.body.price, quantity: req.body.quantity }
        })
        .then(result => {
          res.send(result.modifiedCount > 0)
        })
    })
    // add order 
    app.post("/confirmOrder", async (req, res) => {
      const order = req.body;
      const result = await Order_Collection.insertOne(order);
      res.json(result);
    });


    // load order data according to user id get api
    app.get("/myOrders/:email", async (req, res) => {
      const result = await Order_Collection.find({ email: req.params.email }).toArray();
      console.log(result);
      res.json(result);
    });


    // delete data from cart delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });

    // purchase delete api
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.deleteMany(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port", port);
});