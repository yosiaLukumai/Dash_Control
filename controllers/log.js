const logModel = require("../models/Logs");
const createOutput = require("../utils").createOutput;
const PDFDocument = require("pdfkit");
const fs = require("fs");



// Get logs for a specific machine
const getLogs = async (req, res) => {
  try {
    const { machineId } = req.params;

    const logs = await logModel.find({ machine: machineId }).sort({ timestamp: -1 });
    return res.json(createOutput(true, { logs }));
  } catch (error) {
    console.error(error.message);
    return res.json(createOutput(false, error.message, true));
  }
};

const getLastSixRecords = async (req, res) => {
    try {
      const { machineId } = req.params;
  
      const logs = await logModel
        .find({ machine: machineId })
        .sort({ timestamp: -1 })
        .limit(6)
        .select("data.temperature data.humidity timestamp");
  
      return res.json(createOutput(true, { logs }));
    } catch (error) {
      console.error(error.message);
      return res.json(createOutput(false, error.message, true));
    }
  };


  const exportLastEntryPDF = async (req, res) => {
    try {
      const { machineId } = req.params;
  
      const log = await logModel.findOne({ machine: machineId }).sort({ timestamp: -1 });
  
      if (!log) {
        return res.json(createOutput(false, "No log data found for this machine"));
      }
  
      const doc = new PDFDocument();
      const filePath = `./reports/machine_${machineId}_last_entry.pdf`;
  
      doc.pipe(fs.createWriteStream(filePath));
  
      doc.fontSize(20).text("Machine Data Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Machine ID: ${machineId}`);
      doc.text(`Timestamp: ${log.timestamp}`);
      doc.text("Data:");
      doc.text(`  Temperature: ${log.data.temperature} °C`);
      doc.text(`  Humidity: ${log.data.humidity} %`);
      doc.text(`  pH: ${log.data.pH}`);
      doc.text(`  EC: ${log.data.EC} µs/cm`);
      doc.text(`  N: ${log.data.N} mg/kg`);
      doc.text(`  P: ${log.data.P} mg/kg`);
      doc.text(`  K: ${log.data.K} mg/kg`);
      doc.end();
  
      res.setHeader("Content-Type", "application/pdf");
      res.download(filePath, `machine_${machineId}_last_entry.pdf`, (err) => {
        if (err) console.error("Error sending file:", err.message);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error(error.message);
      return res.json(createOutput(false, error.message, true));
    }
  }; 



  const exportAllDataPDF = async (req, res) => {
    try {
      const { machineId } = req.params;
  
      // Retrieve all logs for the machine
      const logs = await logModel.find({ machine: machineId }).sort({ timestamp: -1 });
  
      if (logs.length === 0) {
        return res.json(createOutput(false, "No log data found for this machine"));
      }
  
      // Create a new PDF document
      const doc = new PDFDocument();
      const filePath = `./reports/machine_${machineId}_all_data.pdf`;
  
      // Save the PDF to a file
      doc.pipe(fs.createWriteStream(filePath));
  
      // Add a title
      doc.fontSize(20).text("Machine Data Report", { align: "center" });
      doc.moveDown();
  
      // Add general machine information
      doc.fontSize(14).text(`Machine ID: ${machineId}`);
      doc.text(`Total Logs: ${logs.length}`);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      doc.moveDown();
  
      // Add a table-like structure for logs
      logs.forEach((log, index) => {
        doc.fontSize(12).text(`Log #${index + 1}`);
        doc.text(`  Timestamp: ${log.timestamp}`);
        doc.text(`  Temperature: ${log.data.temperature} °C`);
        doc.text(`  Humidity: ${log.data.humidity} %`);
        doc.text(`  pH: ${log.data.pH}`);
        doc.text(`  EC: ${log.data.EC} µs/cm`);
        doc.text(`  N: ${log.data.N} mg/kg`);
        doc.text(`  P: ${log.data.P} mg/kg`);
        doc.text(`  K: ${log.data.K} mg/kg`);
        doc.moveDown();
      });
  
      // Finalize the PDF
      doc.end();
  
      // Send the PDF file to the client
      res.setHeader("Content-Type", "application/pdf");
      res.download(filePath, `machine_${machineId}_all_data.pdf`, (err) => {
        if (err) {
          console.error("Error sending file:", err.message);
        }
  
        // Clean up the file after sending
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error(error.message);
      return res.json(createOutput(false, error.message, true));
    }
  };




module.exports = {
    getLogs,
    getLastSixRecords,
    exportAllDataPDF,
    exportLastEntryPDF
}