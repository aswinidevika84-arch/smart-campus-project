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
  try {
    const users = db.getUsers();
    const complaints = db.getComplaints();
    const pendingCount = complaints.filter(c => c.status === "Submitted").length;
    const progressCount = complaints.filter(c => c.status === "In Progress").length;
    const resolvedCount = complaints.filter(c => c.status === "Resolved").length;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Campus - Backend Server Dashboard</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { background: #0f172a; color: #f8fafc; padding: 40px 20px; line-height: 1.6; }
          .container { max-width: 900px; margin: 0 auto; }
          .header { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); }
          .badge { display: inline-block; background: #10b981; color: #022c22; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
          h1 { font-size: 28px; color: #38bdf8; margin-bottom: 6px; }
          p { color: #94a3b8; font-size: 15px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: center; }
          .stat-val { font-size: 32px; font-weight: 800; color: #38bdf8; display: block; }
          .stat-lbl { font-size: 13px; color: #94a3b8; margin-top: 4px; display: block; }
          .section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 24px; }
          h2 { font-size: 20px; color: #f1f5f9; margin-bottom: 16px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
          th, td { padding: 12px; border-bottom: 1px solid #334155; }
          th { color: #94a3b8; font-weight: 600; background: #0f172a; }
          .method { font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
          .method.post { background: #0284c7; color: white; }
          .method.get { background: #16a34a; color: white; }
          .method.patch { background: #d97706; color: white; }
          code { font-family: monospace; background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
          .btn-front { display: inline-block; background: #38bdf8; color: #0f172a; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 10px; }
          .btn-front:hover { background: #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">🟢 SERVER ONLINE</span>
            <h1>Smart Campus API Server</h1>
            <p>Node.js & Express REST Backend for Smart Campus Issue Management System</p>
            <a href="https://smart-campus-project-web.onrender.com" target="_blank" class="btn-front">🌐 Open Frontend Web App ↗</a>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-val">${complaints.length}</span>
              <span class="stat-lbl">Total Complaints</span>
            </div>
            <div class="stat-card">
              <span class="stat-val" style="color: #fbbf24;">${pendingCount}</span>
              <span class="stat-lbl">Pending Review</span>
            </div>
            <div class="stat-card">
              <span class="stat-val" style="color: #60a5fa;">${progressCount}</span>
              <span class="stat-lbl">In Progress</span>
            </div>
            <div class="stat-card">
              <span class="stat-val" style="color: #34d399;">${resolvedCount}</span>
              <span class="stat-lbl">Resolved</span>
            </div>
            <div class="stat-card">
              <span class="stat-val" style="color: #c084fc;">${users.length}</span>
              <span class="stat-lbl">Registered Users</span>
            </div>
          </div>

          <div class="section">
            <h2>Available API Endpoints</h2>
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Access</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="method post">POST</span></td>
                  <td><code>/api/auth/register</code></td>
                  <td>Public</td>
                  <td>Register new Student / Admin account</td>
                </tr>
                <tr>
                  <td><span class="method post">POST</span></td>
                  <td><code>/api/auth/login</code></td>
                  <td>Public</td>
                  <td>Authenticate user and generate JWT token</td>
                </tr>
                <tr>
                  <td><span class="method post">POST</span></td>
                  <td><code>/api/complaints</code></td>
                  <td>Public / Auth</td>
                  <td>Create and submit a new campus issue ticket</td>
                </tr>
                <tr>
                  <td><span class="method get">GET</span></td>
                  <td><code>/api/complaints/:id</code></td>
                  <td>Public</td>
                  <td>Track live status of a single complaint by ID</td>
                </tr>
                <tr>
                  <td><span class="method get">GET</span></td>
                  <td><code>/api/complaints/my</code></td>
                  <td>Student (Auth)</td>
                  <td>Fetch tickets submitted by the logged-in student</td>
                </tr>
                <tr>
                  <td><span class="method get">GET</span></td>
                  <td><code>/api/complaints</code></td>
                  <td>Admin Only</td>
                  <td>List all campus tickets for the admin portal</td>
                </tr>
                <tr>
                  <td><span class="method patch">PATCH</span></td>
                  <td><code>/api/complaints/:id/status</code></td>
                  <td>Admin Only</td>
                  <td>Update status, assign staff, and add resolution remarks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.send("Smart Campus backend is running!");
  }
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