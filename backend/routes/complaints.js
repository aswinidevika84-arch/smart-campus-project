const express = require("express");
const db = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/complaints - create a new complaint (public, no login required to report)
router.post("/", (req, res) => {
  try {
    const { title, description, location, reporterName, reporterEmail } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const complaints = db.getComplaints();

    const newComplaint = {
      id: "CMP" + Date.now().toString().slice(-8),
      title,
      description,
      location: location || "Not specified",
      reporterName: reporterName || "Anonymous",
      reporterEmail: reporterEmail || "",
      status: "Submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    complaints.push(newComplaint);
    db.saveComplaints(complaints);

    res.status(201).json({ message: "Complaint submitted successfully", complaint: newComplaint });
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// GET /api/complaints - list all complaints (admin only)
router.get("/", verifyToken, requireAdmin, (req, res) => {
  const complaints = db.getComplaints().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(complaints);
});

// GET /api/complaints/:id - track a single complaint (public)
router.get("/:id", (req, res) => {
  const complaints = db.getComplaints();
  const complaint = complaints.find((c) => c.id === req.params.id);

  if (!complaint) {
    return res.status(404).json({ message: "No complaint found with this ID" });
  }

  res.json(complaint);
});

// PATCH /api/complaints/:id/status - update status (admin only)
router.patch("/:id/status", verifyToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["Submitted", "In Progress", "Resolved", "Rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const complaints = db.getComplaints();
  const complaint = complaints.find((c) => c.id === req.params.id);

  if (!complaint) {
    return res.status(404).json({ message: "No complaint found with this ID" });
  }

  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();
  db.saveComplaints(complaints);

  res.json({ message: "Status updated", complaint });
});

module.exports = router;
