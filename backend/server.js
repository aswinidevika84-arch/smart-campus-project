const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Campus backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/auth", authRoutes);
app.use("/complaints", complaintRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

const os = require("os");

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

async function startServer() {
  try {
    await db.ensureDb();

    app.listen(PORT, "0.0.0.0", () => {
      const localIp = getLocalIp();
      console.log("\n=======================================================");
      console.log(" 🚀 SMART CAMPUS BACKEND IS RUNNING!");
      console.log(` ➜ Local URL:   http://localhost:${PORT}`);
      console.log(` ➜ Network URL: http://${localIp}:${PORT}`);
      console.log(` ➜ Public URL:  https://smart-campus-project.onrender.com`);
      console.log("=======================================================\n");
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();