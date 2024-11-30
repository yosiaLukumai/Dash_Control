const logModel = require("../models/Logs");
const createOutput = require("../utils").createOutput;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");



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
  
      let logs = await logModel
        .find({ machine: machineId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("data.temperature data.humidity createdAt")
        .lean();

        // Transform the data to the desired format
        logs = logs.map(log => ({
            time: new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            temperature: log.data.temperature,
            humidity: log.data.humidity,
        }));
  
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



  // const exportAllDataPDF = async (req, res) => {
  //   try {
  //     const { machineId } = req.params;
  
  //     // Retrieve all logs for the machine
  //     const logs = await logModel.find({ machine: machineId }).sort({ timestamp: -1 });
  
  //     if (logs.length === 0) {
  //       return res.json(createOutput(false, "No log data found for this machine"));
  //     }
  
  //     // Create a new PDF document
  //     const doc = new PDFDocument();
  //     const filePath = `./reports/machine_${machineId}_all_data.pdf`;
  
  //     // Save the PDF to a file
  //     doc.pipe(fs.createWriteStream(filePath));
  
  //     // Add a title
  //     doc.fontSize(20).text("Machine Data Report", { align: "center" });
  //     doc.moveDown();
  
  //     // Add general machine information
  //     doc.fontSize(14).text(`Machine ID: ${machineId}`);
  //     doc.text(`Total Logs: ${logs.length}`);
  //     doc.text(`Generated At: ${new Date().toLocaleString()}`);
  //     doc.moveDown();
  
  //     logs.forEach((log, index) => {
  //       doc.fontSize(12).text(`Log #${index + 1}`);
  //       doc.text(`  Timestamp: ${log.timestamp}`);
  //       doc.text(`  Temperature: ${log.data.temperature} °C`);
  //       doc.text(`  Humidity: ${log.data.humidity} %`);
  //       doc.text(`  pH: ${log.data.pH}`);
  //       doc.text(`  EC: ${log.data.EC} µs/cm`);
  //       doc.text(`  N: ${log.data.N} mg/kg`);
  //       doc.text(`  P: ${log.data.P} mg/kg`);
  //       doc.text(`  K: ${log.data.K} mg/kg`);
  //       doc.moveDown();
  //     });
  
  //     // Finalize the PDF
  //     doc.end();
  
  //     // Send the PDF file to the client
  //     res.setHeader("Content-Type", "application/pdf");
  //     res.download(filePath, `machine_${machineId}_all_data.pdf`, (err) => {
  //       if (err) {
  //         console.error("Error sending file:", err.message);
  //       }
  
  //       // Clean up the file after sending
  //       fs.unlinkSync(filePath);
  //     });
  //   } catch (error) {
  //     console.error(error.message);
  //     return res.json(createOutput(false, error.message, true));
  //   }
  // };

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
      const filePath = path.join(__dirname, `reports/machine_${machineId}_all_data.pdf`);
  
      // Ensure the directory exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
  
      // Save the PDF to a file
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
  
      // Add a title
      doc.fontSize(20).text("Machine Data Report", { align: "center" });
      doc.moveDown();
  
      // Add general machine information
      doc.fontSize(14).text(`Machine ID: ${machineId}`);
      doc.text(`Total Logs: ${logs.length}`);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      doc.moveDown();
  
      logs.forEach((log, index) => {
        doc.fontSize(12).text(`Log #${index + 1}`);
        doc.text(`  Timestamp: ${log.createdAt.toLocaleString()}`);
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
  
      // Wait for the stream to finish
      writeStream.on("finish", () => {
        res.setHeader("Content-Type", "application/pdf");
        res.download(filePath, `machine_${machineId}_all_data.pdf`, (err) => {
          if (err) {
            console.error("Error sending file:", err.message);
          }
  
          // Clean up the file after sending
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError.message);
          }
        });
      });
  
      // Handle stream errors
      writeStream.on("error", (err) => {
        console.error("Error writing PDF:", err.message);
        return res.json(createOutput(false, "Error generating PDF", true));
      });
    } catch (error) {
      console.error(error.message);
      return res.json(createOutput(false, error.message, true));
    }
  };


  const exportAllDataPDFTable = async (req, res) => {
    try {
      const { machineId } = req.params;
  
      const logs = await logModel.find({ machine: machineId }).sort({ timestamp: -1 });
  
      if (logs.length === 0) {
        return res.json(createOutput(false, "No log data found for this machine"));
      }
  
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, `reports/machine_${machineId}_all_data.pdf`);
  
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
  
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
  
      // Title
      doc.fontSize(20).text("Machine Data Report", { align: "center" });
      doc.moveDown();
  
      // General Information
      doc.fontSize(14).text(`Machine ID: ${machineId}`);
      doc.text(`Total Logs: ${logs.length}`);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      doc.moveDown();
  
      // Table Header
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("No.", 50, doc.y, { continued: true, width: 50 });
      doc.text("Timestamp", 100, doc.y, { continued: true, width: 150 });
      doc.text("Temp (°C)", 250, doc.y, { continued: true, width: 70 });
      doc.text("Humidity (%)", 320, doc.y, { continued: true, width: 80 });
      doc.text("pH", 400, doc.y, { continued: true, width: 50 });
      doc.text("EC (µs/cm)", 450, doc.y, { continued: true, width: 70 });
      doc.text("N (mg/kg)", 520, doc.y, { continued: true, width: 70 });
      doc.text("P (mg/kg)", 590, doc.y, { continued: true, width: 70 });
      doc.text("K (mg/kg)", 660);
      doc.moveDown();
  
      // Table Rows
      doc.font("Helvetica");
      logs.forEach((log, index) => {
        doc.text(`${index + 1}`, 50, doc.y, { continued: true, width: 50 });
        doc.text(`${log.createdAt.toLocaleString()}`, 100, doc.y, { continued: true, width: 150 });
        doc.text(`${log.data.temperature || "-"}`, 250, doc.y, { continued: true, width: 70 });
        doc.text(`${log.data.humidity || "-"}`, 320, doc.y, { continued: true, width: 80 });
        doc.text(`${log.data.pH || "-"}`, 400, doc.y, { continued: true, width: 50 });
        doc.text(`${log.data.EC || "-"}`, 450, doc.y, { continued: true, width: 70 });
        doc.text(`${log.data.N || "-"}`, 520, doc.y, { continued: true, width: 70 });
        doc.text(`${log.data.P || "-"}`, 590, doc.y, { continued: true, width: 70 });
        doc.text(`${log.data.K || "-"}`, 660);
        doc.moveDown();
      });
  
      doc.end();
  
      writeStream.on("finish", () => {
        res.setHeader("Content-Type", "application/pdf");
        res.download(filePath, `machine_${machineId}_all_data.pdf`, (err) => {
          if (err) console.error("Error sending file:", err.message);
  
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError.message);
          }
        });
      });
  
      writeStream.on("error", (err) => {
        console.error("Error writing PDF:", err.message);
        return res.json(createOutput(false, "Error generating PDF", true));
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
    exportLastEntryPDF,
    exportAllDataPDFTable
}