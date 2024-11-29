const userModel = require("../models/users");
const machineModel = require("../models/machines");
const utils = require("../utils");
const createOutput = require("../utils").createOutput;

const register = async (req, res) => {
  try {

    const { email, password, username } = req.body;
    const saved = await userModel.create({
      email,
      password,
      username,
    });
    if (saved) {
      return res.json(createOutput(true, saved));
    } else {
      return res.json(createOutput(false, saved));
    }
  } catch (error) {
    return res.json(createOutput(false, error.message, true));
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json(createOutput(false, "User not found"));
    }

    const passwordMatched = await utils.comparePassword(password, user.password);
    if (!passwordMatched) {
      return res.json(createOutput(false, "Incorrect Password"));
    }

    const machineInUse = await machineModel.findOne({ controlledBy: user._id });
    if (machineInUse) {
      return res.json(
        createOutput(false, "You are already controlling a machine")
      );
    }

    return res.json(createOutput(true, { user }));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};

const logout = async (req, res) => {
  try {
    const { userId } = req.body;

    const machine = await machineModel.findOne({ controlledBy: userId });
    if (machine) {
      machine.controlledBy = null; 
      await machine.save();
    }

    return res.json(createOutput(true, "Logout successful"));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};






module.exports = {
  login,
  logout,
  register,
};
