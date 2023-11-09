const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("rooms server is running...................");
});

app.listen(port, () => {
  console.log(`hotel room server is running on port ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hotelhaven-database.n0h5vlk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomsCollection = client.db("Hotelbooking").collection("rooms");
    const bookingCollection = client.db("Hotelbooking").collection("bookings");

    // all data
    app.get("/rooms", async (req, res) => {
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // singel data by id
    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });
    // booking
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // update date 
    app.patch(`/bookings/:id`, async(req,res)=>{
      const id=req.params.id;
      const bookingDate =req.body;
   

  

      const query = { _id: new ObjectId(id) };



    const options = { upsert: true };



    const updateDoc = {

      $set: {

        dateofbook:bookingDate

      },

    };

    // Update the first document that matches the filter

    const result = await bookingCollection.updateOne(query, updateDoc, options);


    res.send(result)

       
    })
    app.get('/bookings/:id',async(req,res)=>{
      const id =req.params.id;
      const query={_id: new ObjectId(id)};
      const result=await bookingCollection.findOne(query);
      res.send(result)
    })

// Corrected route for delete
app.delete('/bookings/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await bookingCollection.deleteOne(query);
  res.send(result);
});


    // user wise booking
    app.get("/bookings", async (req, res) => {
      // console.log(req.query.customerName);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // const roomsCollection =client.db('Hotelbooking').collection('rooms');

    // app.get('/rooms',async(req,res)=>{
    //   const cursor = roomsCollection.find();
    //   const result =await cursor.toArray();
    //   res.send(result)
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
