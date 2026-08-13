import "./App.css";
import { useState, useEffect } from "react";
import { api } from "./api";

function Navbar({ page, setPage, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setPage("home")}>
        <span className="brand-icon">🏫</span>
        <span className="brand-text">Smart Campus</span>
      </div>
      <div className="nav-links">
        <button
          className={`nav-link-btn ${page === "home" ? "active" : ""}`}
          onClick={() => setPage("home")}
        >
          Home
        </button>
        <button
          className={`nav-link-btn ${page === "report" ? "active" : ""}`}
          onClick={() => setPage("report")}
        >
          Report Issue
        </button>
        <button
          className={`nav-link-btn ${page === "track" ? "active" : ""}`}
          onClick={() => setPage("track")}
        >
          Track Status
        </button>

        {user?.role === "student" && (
          <button
            className={`nav-link-btn student-badge-link ${page === "student-dashboard" ? "active" : ""}`}
            onClick={() => setPage("student-dashboard")}
          >
            🎓 My Complaints
          </button>
        )}

        {user?.role === "admin" && (
          <button
            className={`nav-link-btn admin-badge-link ${page === "admin-dashboard" ? "active" : ""}`}
            onClick={() => setPage("admin-dashboard")}
          >
            🛡️ Admin Portal
          </button>
        )}

        {user ? (
          <div className="user-profile-menu">
            <span className="user-pill">
              <strong>{user.name}</strong> ({user.role})
            </span>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="btn-login-nav" onClick={() => setPage("login")}>
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
}

function HomePage({ setPage, user }) {
  return (
    <div className="home-container">
      <section className="hero">
        <span className="hero-tag">SMART CAMPUS ISSUE MANAGEMENT & RESOLUTION SYSTEM</span>
        <h1>Transparent Campus Resolution Portal</h1>
        <p className="hero-desc">
          Report infrastructure, electrical, plumbing, WiFi, or cleanliness issues directly to campus
          authorities. Track resolution in real-time with verified admin updates.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage("report")}>
            ➕ Report a Problem
          </button>
          <button className="btn-secondary" onClick={() => setPage("track")}>
            🔍 Track by Complaint ID
          </button>
          {user ? (
            user.role === "admin" ? (
              <button className="btn-accent" onClick={() => setPage("admin-dashboard")}>
                🛡️ Open Admin Portal
              </button>
            ) : (
              <button className="btn-accent" onClick={() => setPage("student-dashboard")}>
                🎓 View My Complaints
              </button>
            )
          ) : (
            <button className="btn-outline" onClick={() => setPage("login")}>
              🔑 Login for Student / Admin Dashboard
            </button>
          )}
        </div>
      </section>

      {/* How it works section */}
      <section className="workflow-section">
        <h2>How Complaints are Processed & Resolved</h2>
        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="step-num">1</div>
            <h3>Student Reports Issue</h3>
            <p>
              Submit an issue with location, category, priority, and description. You receive a unique
              Complaint ID.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-num">2</div>
            <h3>Admin Reviews & Assigns</h3>
            <p>
              Campus maintenance authorities inspect incoming tickets and assign dedicated technicians/staff.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-num">3</div>
            <h3>In-Progress Work</h3>
            <p>
              Admins post status updates and remarks so students can see exactly who is working on it.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-num">4</div>
            <h3>Verified Resolution</h3>
            <p>
              Once completed, the ticket is marked Resolved with a completion note and resolution timestamp.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportPage({ setPage, user }) {
  const [form, setForm] = useState({
    title: "",
    category: "Electrical",
    priority: "Medium",
    description: "",
    location: "",
    reporterName: user ? user.name : "",
    reporterEmail: user ? user.email : "",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: null });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        reporterName: user.name || prev.reporterName,
        reporterEmail: user.email || prev.reporterEmail,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: null });

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setStatus({
        loading: false,
        error: "Please fill in title, location, and description.",
        success: null,
      });
      return;
    }

    try {
      const payload = {
        ...form,
        userId: user ? user.id : null,
      };
      const res = await api.createComplaint(payload);
      setStatus({ loading: false, error: "", success: res.complaint });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  if (status.success) {
    return (
      <div className="page-wrapper">
        <div className="success-box">
          <div className="success-icon">✅</div>
          <h2>Complaint Submitted Successfully!</h2>
          <p>Your issue has been dispatched to the campus maintenance department.</p>

          <div className="complaint-id-display">
            <span>Your Tracking ID:</span>
            <h3>{status.success.id}</h3>
          </div>

          <div className="button-group">
            <button
              className="btn-primary"
              onClick={() => {
                sessionStorage.setItem("search_complaint_id", status.success.id);
                setPage("track");
              }}
            >
              🔍 Track Status
            </button>
            {user && (
              <button
                className="btn-secondary"
                onClick={() => setPage(user.role === "admin" ? "admin-dashboard" : "student-dashboard")}
              >
                📊 Go to Dashboard
              </button>
            )}
            <button className="btn-outline" onClick={() => setPage("home")}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h2>Report a Campus Issue</h2>
          <p>Please provide detailed information so the campus team can resolve it quickly.</p>
        </div>

        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-group">
            <label>Issue Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. WiFi not connecting in CS Lab 2"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Electrical">⚡ Electrical (Fan, Light, Power)</option>
                <option value="IT & WiFi">🌐 IT & WiFi / Network</option>
                <option value="Plumbing">🚰 Plumbing & Water Supply</option>
                <option value="Cleanliness">🧹 Cleanliness & Sanitation</option>
                <option value="Infrastructure">🏢 Infrastructure & Furniture</option>
                <option value="Classroom / Lab">🖥️ Classroom / Lab Equipment</option>
                <option value="Hostel / Mess">🛏️ Hostel & Mess</option>
                <option value="Other">📌 Other Issues</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">🟢 Low Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="High">🟠 High Priority</option>
                <option value="Urgent">🔴 Urgent / Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Campus Location / Room *</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Mechanical Block, 2nd Floor, Room 204"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Problem Description *</label>
            <textarea
              name="description"
              placeholder="Explain the issue in detail (e.g. when it happened, exact equipment ID)..."
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reporter Name</label>
              <input
                type="text"
                name="reporterName"
                placeholder="Your Name (Optional)"
                value={form.reporterName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Reporter Email</label>
              <input
                type="email"
                name="reporterEmail"
                placeholder="your.email@campus.edu"
                value={form.reporterEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {status.error && <div className="alert-box error">{status.error}</div>}

          <button type="submit" className="btn-primary btn-block" disabled={status.loading}>
            {status.loading ? "Submitting Ticket..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TrackPage() {
  const [id, setId] = useState(() => sessionStorage.getItem("search_complaint_id") || "");
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    const savedId = sessionStorage.getItem("search_complaint_id");
    if (savedId) {
      handleTrack(savedId);
      sessionStorage.removeItem("search_complaint_id");
    }
  }, []);

  const handleTrack = async (searchId = id) => {
    const cleanId = (searchId || "").trim();
    if (!cleanId) {
      setStatus({ loading: false, error: "Please enter a valid Complaint ID." });
      return;
    }
    setStatus({ loading: true, error: "" });
    setComplaint(null);
    try {
      const data = await api.trackComplaint(cleanId);
      setComplaint(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Complaint not found with this ID" });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="track-container">
        <div className="track-search-box">
          <h2>🔍 Live Complaint Tracker</h2>
          <p>Enter your unique ticket ID to see live progress and admin resolution notes.</p>
          <div className="search-bar-row">
            <input
              type="text"
              placeholder="e.g. CMP12345678"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
            <button className="btn-primary" onClick={() => handleTrack()} disabled={status.loading}>
              {status.loading ? "Searching..." : "Track Status"}
            </button>
          </div>
          {status.error && <div className="alert-box error">{status.error}</div>}
        </div>

        {complaint && (
          <div className="ticket-detail-card">
            <div className="ticket-header">
              <div>
                <span className="ticket-id-badge">{complaint.id}</span>
                <h3>{complaint.title}</h3>
                <span className="ticket-category-tag">📂 {complaint.category || "General"}</span>
                <span className="ticket-priority-tag">⚡ Priority: {complaint.priority || "Medium"}</span>
              </div>
              <div className="status-container">
                <span className={`status-pill status-${complaint.status.replace(/\s/g, "")}`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="stepper-timeline">
              <div className="step-item active">
                <div className="circle">1</div>
                <div className="label">Submitted</div>
              </div>
              <div className={`step-item ${complaint.status === "In Progress" || complaint.status === "Resolved" ? "active" : ""}`}>
                <div className="circle">2</div>
                <div className="label">In Progress</div>
              </div>
              <div className={`step-item ${complaint.status === "Resolved" ? "active resolved" : complaint.status === "Rejected" ? "rejected" : ""}`}>
                <div className="circle">3</div>
                <div className="label">{complaint.status === "Rejected" ? "Rejected" : "Resolved"}</div>
              </div>
            </div>

            <div className="ticket-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>📍 Location:</strong>
                  <span>{complaint.location}</span>
                </div>
                <div className="info-item">
                  <strong>👤 Reported By:</strong>
                  <span>{complaint.reporterName || "Student"} {complaint.reporterEmail && `(${complaint.reporterEmail})`}</span>
                </div>
                <div className="info-item">
                  <strong>📅 Date Submitted:</strong>
                  <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <strong>🕒 Last Updated:</strong>
                  <span>{new Date(complaint.updatedAt || complaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="desc-section">
                <strong>Description:</strong>
                <p>{complaint.description}</p>
              </div>

              {/* Assigned Staff & Admin Resolution Remarks */}
              <div className="resolution-feedback-box">
                <h4>🛠️ Authority & Resolution Updates</h4>
                {complaint.assignedTo ? (
                  <p><strong>👷 Assigned Technician/Department:</strong> {complaint.assignedTo}</p>
                ) : (
                  <p className="text-muted">No specific technician assigned yet.</p>
                )}

                {complaint.adminRemarks ? (
                  <div className="remarks-box">
                    <strong>📝 Admin Remarks:</strong>
                    <p>{complaint.adminRemarks}</p>
                  </div>
                ) : (
                  <p className="text-muted">Awaiting admin review remarks.</p>
                )}

                {complaint.resolvedBy && (
                  <p className="resolved-by-tag">
                    ✅ <strong>Resolved By Admin:</strong> {complaint.resolvedBy} on {new Date(complaint.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentDashboardPage({ user, setPage }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState({ loading: true, error: "" });

  const fetchComplaints = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await api.getMyComplaints();
      setComplaints(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Failed to load complaints" });
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  const countTotal = complaints.length;
  const countSubmitted = complaints.filter((c) => c.status === "Submitted").length;
  const countInProgress = complaints.filter((c) => c.status === "In Progress").length;
  const countResolved = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>🎓 Student Portal: My Complaints</h2>
          <p>Welcome back, <strong>{user?.name}</strong>. Here you can track all the complaints you submitted.</p>
        </div>
        <button className="btn-primary" onClick={() => setPage("report")}>
          ➕ Report New Complaint
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="stats-row">
        <div className="stat-card" onClick={() => setFilter("All")}>
          <span className="stat-num">{countTotal}</span>
          <span className="stat-label">Total Submitted</span>
        </div>
        <div className="stat-card stat-pending" onClick={() => setFilter("Submitted")}>
          <span className="stat-num">{countSubmitted}</span>
          <span className="stat-label">Awaiting Action</span>
        </div>
        <div className="stat-card stat-progress" onClick={() => setFilter("In Progress")}>
          <span className="stat-num">{countInProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card stat-resolved" onClick={() => setFilter("Resolved")}>
          <span className="stat-num">{countResolved}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-bar">
        {["All", "Submitted", "In Progress", "Resolved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {status.loading && <div className="loading-spinner">Loading your complaints...</div>}
      {status.error && <div className="alert-box error">{status.error}</div>}

      {!status.loading && filteredComplaints.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-icon">📂</div>
          <h3>No complaints found</h3>
          <p>You have no tickets under '{filter}' status.</p>
          <button className="btn-secondary" onClick={() => setPage("report")}>
            Submit a Complaint Now
          </button>
        </div>
      )}

      <div className="cards-grid">
        {filteredComplaints.map((c) => (
          <div key={c.id} className="ticket-card">
            <div className="ticket-card-header">
              <div>
                <span className="id-tag">{c.id}</span>
                <h4>{c.title}</h4>
              </div>
              <span className={`status-pill status-${c.status.replace(/\s/g, "")}`}>
                {c.status}
              </span>
            </div>

            <p className="card-desc">{c.description}</p>

            <div className="card-meta">
              <span>📍 {c.location}</span>
              <span>📂 {c.category || "General"}</span>
              <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Remarks and Admin resolution */}
            {(c.adminRemarks || c.assignedTo || c.resolvedBy) && (
              <div className="card-remarks">
                {c.assignedTo && <p>👷 <strong>Assigned:</strong> {c.assignedTo}</p>}
                {c.adminRemarks && <p>📝 <strong>Admin Note:</strong> {c.adminRemarks}</p>}
                {c.resolvedBy && <p className="text-success">✅ <strong>Resolved by:</strong> {c.resolvedBy}</p>}
              </div>
            )}

            <div className="card-footer">
              <button
                className="btn-sm-track"
                onClick={() => {
                  sessionStorage.setItem("search_complaint_id", c.id);
                  setPage("track");
                }}
              >
                🔍 Live Timeline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboardPage({ user, setPage }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", adminRemarks: "", assignedTo: "" });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchAllComplaints = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await api.listComplaints();
      setComplaints(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Failed to load complaints" });
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleEditClick = (complaint) => {
    setEditingId(complaint.id);
    setEditForm({
      status: complaint.status || "Submitted",
      adminRemarks: complaint.adminRemarks || "",
      assignedTo: complaint.assignedTo || "",
    });
  };

  const handleSaveUpdate = async (id) => {
    setSaveLoading(true);
    try {
      const res = await api.updateStatus(id, editForm);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? res.complaint : c))
      );
      setEditingId(null);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="page-wrapper">
        <div className="form-card text-center">
          <h2>🚫 Access Restricted</h2>
          <p>You must be logged in with an <strong>Admin</strong> account to access the administration portal.</p>
          <button className="btn-primary" onClick={() => setPage("login")}>
            Login as Admin
          </button>
        </div>
      </div>
    );
  }

  const countTotal = complaints.length;
  const countSubmitted = complaints.filter((c) => c.status === "Submitted").length;
  const countInProgress = complaints.filter((c) => c.status === "In Progress").length;
  const countResolved = complaints.filter((c) => c.status === "Resolved").length;
  const countRejected = complaints.filter((c) => c.status === "Rejected").length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter = filter === "All" || c.status === filter;
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      c.id.toLowerCase().includes(s) ||
      c.title.toLowerCase().includes(s) ||
      c.location.toLowerCase().includes(s) ||
      (c.reporterName && c.reporterName.toLowerCase().includes(s)) ||
      (c.reporterEmail && c.reporterEmail.toLowerCase().includes(s));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>🛡️ Campus Authority & Admin Portal</h2>
          <p>
            Review tickets, assign maintenance personnel, post resolution remarks, and update complaint status.
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchAllComplaints}>
          🔄 Refresh Tickets
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="stats-row">
        <div className="stat-card" onClick={() => setFilter("All")}>
          <span className="stat-num">{countTotal}</span>
          <span className="stat-label">Total Tickets</span>
        </div>
        <div className="stat-card stat-pending" onClick={() => setFilter("Submitted")}>
          <span className="stat-num">{countSubmitted}</span>
          <span className="stat-label">Pending / New</span>
        </div>
        <div className="stat-card stat-progress" onClick={() => setFilter("In Progress")}>
          <span className="stat-num">{countInProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card stat-resolved" onClick={() => setFilter("Resolved")}>
          <span className="stat-num">{countResolved}</span>
          <span className="stat-label">Resolved</span>
        </div>
        <div className="stat-card stat-rejected" onClick={() => setFilter("Rejected")}>
          <span className="stat-num">{countRejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by ID, title, location, student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tab-bar">
          {["All", "Submitted", "In Progress", "Resolved", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {status.loading && <div className="loading-spinner">Loading campus complaints...</div>}
      {status.error && <div className="alert-box error">{status.error}</div>}

      {!status.loading && filteredComplaints.length === 0 && (
        <div className="empty-state-card">
          <h3>No complaints match your filter or search.</h3>
        </div>
      )}

      <div className="admin-cards-list">
        {filteredComplaints.map((c) => (
          <div key={c.id} className="admin-ticket-card">
            <div className="admin-ticket-main">
              <div className="ticket-top-row">
                <div className="ticket-title-group">
                  <span className="id-tag">{c.id}</span>
                  <h3>{c.title}</h3>
                  <span className="ticket-category-tag">📂 {c.category || "General"}</span>
                  <span className="ticket-priority-tag">⚡ {c.priority || "Medium"}</span>
                </div>
                <span className={`status-pill status-${c.status.replace(/\s/g, "")}`}>
                  {c.status}
                </span>
              </div>

              <p className="admin-desc">{c.description}</p>

              <div className="admin-meta-row">
                <span>📍 <strong>Location:</strong> {c.location}</span>
                <span>👤 <strong>Reporter:</strong> {c.reporterName || "Student"} ({c.reporterEmail || "No email"})</span>
                <span>📅 <strong>Date:</strong> {new Date(c.createdAt).toLocaleString()}</span>
              </div>

              {/* Current details */}
              <div className="admin-current-remarks">
                <p>👷 <strong>Assigned Staff:</strong> {c.assignedTo || <em className="text-muted">Not assigned</em>}</p>
                <p>📝 <strong>Admin Remarks:</strong> {c.adminRemarks || <em className="text-muted">None</em>}</p>
                {c.resolvedBy && (
                  <p className="text-success">
                    ✅ <strong>Resolved By:</strong> {c.resolvedBy} on {new Date(c.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action / Edit Area */}
            <div className="admin-action-box">
              {editingId === c.id ? (
                <div className="edit-form-panel">
                  <h4>Update Resolution & Status</h4>
                  <div className="form-group-sm">
                    <label>Status:</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="form-group-sm">
                    <label>Assign Staff / Technician:</label>
                    <input
                      type="text"
                      placeholder="e.g. Electrical Dept - Mr. Kumar"
                      value={editForm.assignedTo}
                      onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    />
                  </div>

                  <div className="form-group-sm">
                    <label>Admin Remarks / Work Note:</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Technician inspected; capacitor replaced. Issue closed."
                      value={editForm.adminRemarks}
                      onChange={(e) => setEditForm({ ...editForm, adminRemarks: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="btn-row-sm">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleSaveUpdate(c.id)}
                      disabled={saveLoading}
                    >
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => handleEditClick(c)}>
                  ✏️ Update Status & Remarks
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPage({ setPage, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const res = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      onLoginSuccess(res.user);

      if (res.user.role === "admin") {
        setPage("admin-dashboard");
      } else {
        setPage("student-dashboard");
      }
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Login failed" });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-card auth-card">
        <h2>{isRegister ? "Create Campus Account" : "Login to Portal"}</h2>
        <p className="auth-subtitle">
          {isRegister
            ? "Sign up as Student to track your tickets, or Admin to resolve them."
            : "Sign in to access your student complaints or admin resolution panel."}
        </p>

        <form onSubmit={handleSubmit} className="custom-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. rahul@campus.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Select Role *</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">🎓 Student (Submit & Track My Issues)</option>
                <option value="admin">🛡️ Campus Authority / Admin (Review & Resolve)</option>
              </select>
            </div>
          )}

          {status.error && <div className="alert-box error">{status.error}</div>}

          <button type="submit" className="btn-primary btn-block" disabled={status.loading}>
            {status.loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="toggle-auth" onClick={() => setIsRegister(!isRegister)}>
          {isRegister
            ? "Already have an account? Sign In"
            : "New student or admin? Create an account"}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  let content;
  if (page === "report") {
    content = <ReportPage setPage={setPage} user={user} />;
  } else if (page === "track") {
    content = <TrackPage />;
  } else if (page === "student-dashboard") {
    content = <StudentDashboardPage user={user} setPage={setPage} />;
  } else if (page === "admin-dashboard") {
    content = <AdminDashboardPage user={user} setPage={setPage} />;
  } else if (page === "login") {
    content = <LoginPage setPage={setPage} onLoginSuccess={setUser} />;
  } else {
    content = <HomePage setPage={setPage} user={user} />;
  }

  return (
    <div className="app-layout">
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main className="app-main">{content}</main>
      <footer className="app-footer">
        <p>© 2026 Smart Campus Issue Management System. Designed for transparent campus operations.</p>
      </footer>
    </div>
  );
}

export default App;

