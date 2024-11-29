const router = require("express").Router()
const machineController = require("../controllers/machines")

const machineRoutes = (app) => {
    router.post("/register", machineController.registerMachine);
    return app.use("/machine", router)
}

module.exports = { machineRoutes }