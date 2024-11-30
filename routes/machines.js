const router = require("express").Router()
const machineController = require("../controllers/machines")

const machineRoutes = (app) => {
    router.post("/register", machineController.registerMachine);
    router.get("/:machineId", machineController.getMachineData)
    router.get("/names", machineController.fetchMachineNames)
    return app.use("/machine", router)
}

module.exports = { machineRoutes }