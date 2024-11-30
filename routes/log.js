const router = require("express").Router()
const logsController = require("../controllers/log")

const LogsRouter = (app) => {
    router.get("/machines/:machineId/export-all", logsController.exportAllDataPDFTable)
    router.get("/machines/:machineId/export-lastentry", logsController.exportLastEntryPDF)
    router.get("/machines/:machineId/lastsix", logsController.getLastSixRecords)
    return app.use("/logs", router)
}

module.exports = { LogsRouter }