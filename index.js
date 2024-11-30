const app = require("express")();
const express = require("express");
const dbConfig = require("./db/connect");
const logModal = require("./models/Logs")
const machineModal = require("./models/machines")
const userRoutes = require("./routes/users");
const logsRoutes = require("./routes/log")
const machineRoutes = require("./routes/machines")
const cors = require("cors");
const { Server } = require('socket.io')
const http = require("http");
require("dotenv").config();

dbConfig.connectDb();
const mqtt = require('mqtt');
const brokerUrl = 'mqtt://143.198.62.200:1883';


// limiting all the acces that comes from other hosting
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/test", (req, res) => {
  res.send("LOL's up in the air");
});

// bringing all the routes
userRoutes.userRoutes(app);
machineRoutes.machineRoutes(app)
logsRoutes.LogsRouter(app)



const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})



io.on("connect", (socket) => {
  console.log('connected')
  socket.on("disconnect", () => {
    console.log("client disconnected..");
  })
})


const client = mqtt.connect(brokerUrl);

client.on('connect', function () {
  console.log('Connected to broker');
  client.subscribe('machine/log', function (err) {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to topic: machine/log');
    }
  });
});

// Handle incoming messages
client.on('message', async function (topic, message) {
  // message is a buffer, so convert it to string
  let MyData = JSON.parse(message)
  if (topic == "machine/log") {
    try {
      let machine = await machineModal.findByIdAndUpdate(MyData.machineID, {
        data: {
          temperature: MyData.temp,
          humidity: MyData.hum,
          pH: MyData.ph,
          EC: MyData.ec,
          N: MyData.n,
          P: MyData.p,
          K: MyData.k
        }
      })
      console.log("An update made is...", machine)
      if (machine) {
        const saved = await await logModal.create({
          machine: MyData?.machineID,
          data: {
            temperature: MyData.temp,
            humidity: MyData.hum,
            pH: MyData.ph,
            EC: MyData.ec,
            N: MyData.n,
            P: MyData.p,
            K: MyData.k
          }
        })
        if (saved) {
          // let update the machine data 
          io.emit("newdata", JSON.stringify({ ...machine, ...saved }))
        }
      } else {
        console.log(" No machine with such ID");
      }
    } catch (error) {
      console.log(error);
    }
  }
});

io.on("new/config", (data)=> {
  console.log(data)
})

client.on('error', function (err) {
  console.error('Connection error:', err);
});




server.listen(process.env.PORT, () => {
  console.log(`App running and connected to port ${process.env.PORT}`);
});
module.exports.Socket = io


