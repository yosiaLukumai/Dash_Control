const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'machines', required: true }, // Reference to the Machine
  data: {
    temperature: { type: Number, required: true }, // °C
    humidity: { type: Number, required: true },    // %
    pH: { type: Number, required: true },         // pH value
    EC: { type: Number, required: true },         // μS/cm
    N: { type: Number, required: true },          // mg/kg
    P: { type: Number, required: true },          // mg/kg
    K: { type: Number, required: true },          // mg/kg
  }
}, {
  timestamp: true
});

module.exports = mongoose.model('logs', LogSchema);
