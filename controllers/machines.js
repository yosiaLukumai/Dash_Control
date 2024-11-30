const userModel = require("../models/users");
const machineModel = require("../models/machines");
const logModel = require("../models/Logs");
const createOutput = require("../utils").createOutput;

const getMachines = async (req, res) => {
  try {
    const machines = await machineModel.find();
    return res.json(createOutput(true, { machines }));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};

const fetchMachineNames = async (req, res) => {
  try {
    // Retrieve all machines, selecting only the `name` and `_id` fields
    const machines = await machineModel.find({}, { name: 1, _id: 1 });

    // Check if there are any machines
    if (machines.length === 0) {
      return res.json(createOutput(false, "No machines found"));
    }

    // Return the machines
    return res.json(createOutput(true, machines));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};


const controlMachine = async (req, res) => {
  try {
    const { machineId, userId } = req.body;

    const machine = await machineModel.findById(machineId);
    if (machine.controlledBy) {
      return res.json(createOutput(false, "Machine is already in use"));
    }

    machine.controlledBy = userId;
    await machine.save();

    return res.json(createOutput(true, { machine }));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};

const releaseMachine = async (req, res) => {
  try {
    const { machineId } = req.body;
    
    const machine = await machineModel.findById(machineId);
    if (!machine.controlledBy) {
      return res.json(createOutput(false, "Machine is not being controlled"));
    }

    machine.controlledBy = null; // Free the machine
    await machine.save();

    return res.json(createOutput(true, "Machine released"));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};

const updateMachineData = async (req, res) => {
  try {
    const { machineId, data } = req.body;

    const machine = await machineModel.findById(machineId);
    if (!machine) {
      return res.json(createOutput(false, "Machine not found"));
    }

    machine.data = data;
    await machine.save();

    const log = new logModel({
      machine: machine._id,
      data,
    });
    await log.save();

    return res.json(createOutput(true, { machine }));
  } catch (error) {
    return res.json(createOutput(false, error.message, true));
  }
};

const getMachineData = async (req, res) => { 
  try {
    const { machineId } = req.params;
    const machine = await machineModel.findById(machineId);
    if (machine) {
      return res.json(createOutput(true, machine));
    }else {
      return res.json(createOutput(false, "Machine not found"));
    }
  } catch (error) {
    return res.json(createOutput(false, error.message, true));
  }
}


const registerMachine = async (req, res) => {
    try {
      const { name } = req.body;
      const newMachine = new machineModel({
        name,
        data: {
          temperature: 0,
          humidity: 0,
          pH: 0,
          EC: 0,
          N: 0,
          P: 0,
          K: 0,
        },
      });
  
      await newMachine.save();
      return res.json(createOutput(true, { machine: newMachine }));
    } catch (error) {
      console.error(error.message);
      return res.json(createOutput(false, error.message, true));
    }
  };
  



module.exports = { 
    updateMachineData,
    releaseMachine,
    controlMachine,
    getMachines,
    registerMachine,
    fetchMachineNames,
    getMachineData
}