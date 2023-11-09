const express = require("express");
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors({
  origin:['http://localhost:5173','https://hotel-booking-auth-e8380.web.app','https://hotel-booking-auth-e8380.firebaseapp.com'],
  credentials:true
}));
app.use(cookieParser())
app.use(express.json());
app.get("/", (req, res) => {
  res.send("rooms server is running...................");
});
// ours midware
const logger =async(req,res,next)=>{
  console.log('called',req.host,req.originalUrl)
  next()
}

const verifyToken =async(req,res,next)=>{
  const token=req.cookies?.token;
  console.log('valu of token in midware',token)
  if(!token){
    return res.status(401).send({message:'not authorized'})
  }

  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    // error
    if(err){
      console.log(err)
      return res.status(401).send({message:"unauthorized"})
    }
    console.log("vlaue of the token ",decoded)
    req.user=decoded;

    next()
  })
}


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

// Auth related api 
app.post('/jwt',logger,async(req,res)=>{
  const user =req.body;
  console.log(user);
  const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'})

  res.cookie('token',token,{
    httpOnly:true,
    secure:false,
    sameSite: 'none'
  }).send({success:true})
})



    // all data
    app.get("/rooms",logger, async (req, res) => {
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
      const dateofbook =req.body.dateofbook;
   

  

      const query = { _id: new ObjectId(id) };



    const options = { upsert: true };



    const updateDoc = {

      $set: {

        dateofbook:dateofbook

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
    app.get("/bookings",logger,verifyToken, async (req, res) => {
      // console.log(req.query.customerName);
      console.log('from valid user',req.user)
      // console.log('tok tok token',req.cookies.token)
      // if(req.query.email!==req.user.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }
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
