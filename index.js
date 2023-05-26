const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()

// Middleware Part 

app.use(cors({
  origin: "https://khelna-chai-server-side.onrender.com",
  headers: ["Content-Type"],
  credentials: true,
}));
// app.options("", cors(corsConfig))

app.use(express.json());

// Mongo 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rb3bs7x.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db("ToysDb")
const toysStore = database.collection('toysStore')
async function run() {

  try {

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(`Your Port is Running on ${port}`)
})
// All Data 

app.get('/datas', async (req, res) => {

  let query = {};
  if (req.query?.seller_Email) {
    query = { seller_Email: req.query.seller_Email }
  }
  const options ={
    sort: { "price": -1 }
  }
  const result = await toysStore.find(query,options).toArray();
  res.send(result)
})
// Specific id data

app.get(`/datas/:id`, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const options = {

    projection: { toys_Name: 1, price: 1, photo: 1, rating: 1, seller_Name: 1, seller_Email: 1, quantity: 1, details: 1, }
  }
  const toy = await toysStore.findOne(query, options);
  res.send(toy);
})
// Input Toys
app.post('/datas', async (req, res) => {
  const store = await req.body;
  console.log(store);
  const result = await toysStore.insertOne(store);
  res.send(result)
})

// DELETE 
app.delete(`/datas/:id`, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await toysStore.deleteOne(query);
  res.send(result);
})
// PUT 
app.put('/datas/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const update = req.body;
  const options = { upsert: false };

  const setUpdate = {
    $set: {
      details: update.details, quantity: update.quantity, price: update.price
    }
  }
  const result = await toysStore.updateOne(filter, setUpdate, options)
  res.send(result)
})


app.listen(port, () => {
  console.log(`Running on port ${port}`)
})