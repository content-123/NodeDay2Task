const express = require('express');
const bodyParser = require('body-parser');
// const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const app = express();
const port = 2000;


app.use(bodyParser.json());

const rooms = [ 
    { "seats":50,
"amenities":"party hall",
"pricePerHour":3000
},
{ 

"seats":100,
"amenities":"dining area",
"pricePerHour":2000
},
{ 
"seats":150,
"amenities":"Parking",
"pricePerHour":200
},
{ 
    
    "seats":75,
  "amenities":"Play area",
  "pricePerHour":1500
},
{ 
"seats":30,
"amenities":"Swimmimg pool",
"pricePerHour":6000
}];
const bookings = [
    
    {   
        
        "customerName":"John",
        "date":"2023-12-04",
        "startTime":"09:00am ",
        "endTime":"01;00pm",
        "roomId":100
    },
    
    {   
        "customerName":"Peter",
        "date":"2023-12-10",
        "startTime":"10:00 am",
        "endTime":"02:00pm",
        "roomId":200
    },
    
    {   
        "customerName":"John",
        "date":"2023-12-15",
        "startTime":"11:00 am",
        "endTime":"03:00pm",
        "roomId":300
    },
    
    {   
        "customerName":"Neha",
        "date":"2023-12-11",
        "startTime":"04:00pm",
        "endTime":"07:00pm",
        "roomId":400
    },
    
    {   
        
        "customerName":"Alex",
        "date":"2023-12-19",
        "startTime":"10:00pm",
        "endTime":"01:00am",
        "roomId":500
    }];
    const MONGO_URL = "mongodb://127.0.0.1:27017"


    async function createConnection() {
        const client = new MongoClient(MONGO_URL);
        await client.connect()
        console.log("MONGODB connected")
        return client;
    }
    async function startServer() {
   const client = await createConnection();

   const roomsCollection = client.db("Database1").collection("rooms");
const bookingsCollection = client.db("Database1").collection("bookings");


// 1. Create a Room
app.post('/rooms', async (req, res) => {
  const { seats, amenities, pricePerHour } = req.body;
  const room = {
        seats,
    amenities,
    pricePerHour,
  };
//   rooms.push(room);

    await roomsCollection.insertOne(room);

  res.status(201).json({ message: 'Room created successfully', room });
});

// 2. Book a Room
app.post('/bookings', async (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;


const bookingsCollection = client.db("Database1").collection("bookings");
const conflictingBooking = await bookingsCollection.findOne({
    roomId,
    date,
    $or: [
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
});

if (conflictingBooking) {
    return res.status(400).json({ error: 'Room is already booked for the given date and time' });
}

const booking = { customerName, date, startTime, endTime, roomId };
await bookingsCollection.insertOne(booking);
res.status(201).json({ message: 'Room booked successfully', booking });
});

app.get('/rooms', async (req, res) => {
    const roomBookings = await roomsCollection.find().toArray();
    res.json(roomBookings);
});

// 4. List all customers with booked Data
app.get('/customers', async (req, res) => {
    const customerBookings = await bookingsCollection.find().toArray();
    res.json(customerBookings);
});

// 5. List how many times a customer has booked the room
app.get('/customer/bookings/:customerName', async (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = await bookingsCollection.find({ customerName }).toArray();
    res.json({ customerBookings });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
    }
    startServer();