const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  data: {
    temperature: { type: Number, default: 0 }, // °C
    humidity: { type: Number, default: 0 },    // %
    pH: { type: Number, default: 7 },         // pH value
    EC: { type: Number, default: 0 },         // μS/cm
    N: { type: Number, default: 0 },          // mg/kg
    P: { type: Number, default: 0 },          // mg/kg
    K: { type: Number, default: 0 },   
    setedHumidity: { type: Number, default: 0 },    // %
    setedTemperature: { type: Number, default: 0 }, // °C
  },
  controlledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }, 
}, { timestamps: true }); 

module.exports = mongoose.model('machines', MachineSchema);
