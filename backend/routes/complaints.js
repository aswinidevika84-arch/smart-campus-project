const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "smart_campus_dev_secret";

// Optional token extractor
function getOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }
  return null;
}

// POST /api/complaints - create a new complaint (public or logged-in)
router.post("/", (req, res) => {
  try {
    const { title, description, location, category, priority, reporterName, reporterEmail, userId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const authUser = getOptionalUser(req);
    const resolvedUserId = userId || (authUser ? authUser.id : null);
    const resolvedEmail = reporterEmail || (authUser ? authUser.email : "");

    const complaints = db.getComplaints();

    const newComplaint = {
      id: "CMP" + Date.now().toString().slice(-8),
      title,
      description,
      location: location || "Campus",
      category: category || "General",
      priority: priority || "Medium",
      reporterName: reporterName || (authUser ? authUser.name : "Student"),
      reporterEmail: resolvedEmail,
      userId: resolvedUserId,
      status: "Submitted",
      assignedTo: "",
      adminRemarks: "",
      resolvedBy: "",
      resolvedAt: null,
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

// GET /api/complaints/my - list complaints for logged in student
router.get("/my", verifyToken, (req, res) => {
  try {
    const complaints = db.getComplaints();
    const userEmail = (req.user.email || "").toLowerCase();
    const userId = req.user.id;

    const myComplaints = complaints
      .filter((c) => (c.userId && c.userId === userId) || (c.reporterEmail && c.reporterEmail.toLowerCase() === userEmail))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(myComplaints);
  } catch (err) {
    console.error("Get my complaints error:", err);
    res.status(500).json({ message: "Failed to fetch student complaints" });
  }
});

// GET /api/complaints - list all complaints (admin only)
router.get("/", verifyToken, requireAdmin, (req, res) => {
  try {
    const complaints = db.getComplaints().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(complaints);
  } catch (err) {
    console.error("Get all complaints error:", err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// GET /api/complaints/:id - track a single complaint (public)
router.get("/:id", (req, res) => {
  try {
    const complaints = db.getComplaints();
    const complaint = complaints.find((c) => c.id.toUpperCase() === req.params.id.toUpperCase());

    if (!complaint) {
      return res.status(404).json({ message: "No complaint found with this ID" });
    }

    res.json(complaint);
  } catch (err) {
    console.error("Track complaint error:", err);
    res.status(500).json({ message: "Failed to fetch complaint details" });
  }
});

// PATCH /api/complaints/:id/status - update status and remarks (admin only)
router.patch("/:id/status", verifyToken, requireAdmin, (req, res) => {
  try {
    const { status, adminRemarks, assignedTo } = req.body;
    const allowedStatuses = ["Submitted", "In Progress", "Resolved", "Rejected"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaints = db.getComplaints();
    const complaint = complaints.find((c) => c.id.toUpperCase() === req.params.id.toUpperCase());

    if (!complaint) {
      return res.status(404).json({ message: "No complaint found with this ID" });
    }

    if (status) complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;

    if (status === "Resolved") {
      complaint.resolvedBy = req.user.email;
      complaint.resolvedAt = new Date().toISOString();
    } else if (status === "In Progress" || status === "Submitted") {
      complaint.resolvedBy = "";
      complaint.resolvedAt = null;
    }

    complaint.updatedAt = new Date().toISOString();
    db.saveComplaints(complaints);

    res.json({ message: "Complaint updated successfully", complaint });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});

module.exports = router;

