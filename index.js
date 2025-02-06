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
const e = require("express");
const brokerUrl = 'mqtt://45.79.206.183:1883';



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
  client.subscribe("new/config/from/machine", function (err) {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to topic: machine/config/from/machine');
    }
  })
});


io.on("connect", (socket) => {
  console.log('connected')
  socket.on("disconnect", () => {
    console.log("client disconnected..");
  })
  socket.on("new/config", async(data)=> {
    let dats = JSON.parse(data)
    
    if(dats.machineId) {
      // save the data to the database
      let machineUpdated = await machineModal.findByIdAndUpdate(
        dats.machineId,
        { 
            $set: { 
                "data.setedHumidity": dats.humidity,
                "data.setedTemperature": dats.temperature
            } 
        },
        { new: true } // Returns the updated document
    );
      
      if(machineUpdated) {
        client.publish("new/config", data)
      }
    }
  })
  // machine controls
  socket.on("new/config/machine",  (data)=> {
    let dats = JSON.parse(data)
    if(dats.machine) {
      client.publish("new/config/machine", data)
    }
  })

})


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
        const saved = await logModal.create({
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
          io.emit("newdata", JSON.stringify(saved ))
        }
      } else {
        console.log(" No machine with such ID");
      }
    } catch (error) {
      console.log(error);
    }
  }

  if(topic == "new/config/from/machine") {

    // sprinkler: boolean;
    // motor: boolean;
    // pump: boolean;
    // machine: string;
    io.emit("new/config/machine", message)
  }
});



client.on('error', function (err) {
  console.error('Connection error:', err);
});




server.listen(process.env.PORT, () => {
  console.log(`App running and connected to port ${process.env.PORT}`);
});
module.exports.Socket = io


