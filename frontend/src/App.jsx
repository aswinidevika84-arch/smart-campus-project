import "./App.css";
import { useState, useEffect } from "react";
import { api } from "./api";

function Navbar({ page, setPage, user, onLogout }) {
  return (
    <nav className="navbar">
      <h2 onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
        🏫 Smart Campus
      </h2>
      <div className="nav-links">
        <span onClick={() => setPage("home")}>Home</span>
        <span onClick={() => setPage("track")}>Track Complaint</span>
        {user?.role === "admin" && (
          <span onClick={() => setPage("dashboard")}>Dashboard</span>
        )}
        {user ? (
          <>
            <span className="user-pill">Hi, {user.name}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>Login</button>
        )}
      </div>
    </nav>
  );
}

function HomePage({ setPage }) {
  return (
    <section className="hero">
      <p>SMART CAMPUS MANAGEMENT</p>
      <h1>Get Them Resolved.</h1>
      <p>
        Report campus problems, share your location, and track your
        complaint until it's resolved.
      </p>
      <div className="buttons">
        <button onClick={() => setPage("report")}>Report an Issue</button>
        <button onClick={() => setPage("track")}>Track Complaint</button>
      </div>
    </section>
  );
}

function ReportPage({ setPage }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    reporterName: "",
    reporterEmail: "",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: null });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: null });

    if (!form.title.trim() || !form.description.trim()) {
      setStatus({ loading: false, error: "Please fill in the title and description.", success: null });
      return;
    }

    try {
      const res = await api.createComplaint(form);
      setStatus({ loading: false, error: "", success: res.complaint });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  if (status.success) {
    return (
      <div className="form-page">
        <h1>Complaint Submitted!</h1>
        <div className="success-card">
          <p>Your complaint has been recorded. Save this ID to track it:</p>
          <p className="complaint-id">{status.success.id}</p>
        </div>
        <div className="buttons">
          <button onClick={() => setPage("track")}>Track This Complaint</button>
          <button onClick={() => setPage("home")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <h1>Report an Issue</h1>
      <form onSubmit={handleSubmit} className="form-fields">
        <input
          type="text"
          name="title"
          placeholder="Issue title"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Describe the problem"
          value={form.description}
          onChange={handleChange}
        ></textarea>
        <input
          type="text"
          name="location"
          placeholder="Location (e.g. CS Block, Lab 3)"
          value={form.location}
          onChange={handleChange}
        />
        <input
          type="text"
          name="reporterName"
          placeholder="Your name (optional)"
          value={form.reporterName}
          onChange={handleChange}
        />
        <input
          type="email"
          name="reporterEmail"
          placeholder="Your email (optional)"
          value={form.reporterEmail}
          onChange={handleChange}
        />

        {status.error && <p className="error-text">{status.error}</p>}

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}

function TrackPage() {
  const [id, setId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleTrack = async () => {
    if (!id.trim()) {
      setStatus({ loading: false, error: "Please enter a complaint ID." });
      return;
    }
    setStatus({ loading: true, error: "" });
    setComplaint(null);
    try {
      const data = await api.trackComplaint(id.trim());
      setComplaint(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="form-page">
      <h1>Track Complaint</h1>
      <input
        type="text"
        placeholder="Enter Complaint ID (e.g. CMP12345678)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleTrack} disabled={status.loading}>
        {status.loading ? "Searching..." : "Track Status"}
      </button>

      {status.error && <p className="error-text">{status.error}</p>}

      {complaint && (
        <div className="complaint-card">
          <h3>{complaint.title}</h3>
          <p>{complaint.description}</p>
          <p><strong>Location:</strong> {complaint.location}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge status-${complaint.status.replace(/\s/g, "")}`}>
              {complaint.status}
            </span>
          </p>
          <p className="timestamp">
            Submitted: {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
      )}
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
      setPage(res.user.role === "admin" ? "dashboard" : "home");
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="form-page">
      <h1>{isRegister ? "Create Account" : "Login"}</h1>
      <form onSubmit={handleSubmit} className="form-fields">
        {isRegister && (
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        {isRegister && (
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        )}

        {status.error && <p className="error-text">{status.error}</p>}

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="toggle-link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "New here? Create an account"}
      </p>
    </div>
  );
}

function DashboardPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  const loadComplaints = async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await api.listComplaints();
      setComplaints(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="form-page">
        <h1>Access Denied</h1>
        <p>Only admins can view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      {status.loading && <p>Loading complaints...</p>}
      {status.error && <p className="error-text">{status.error}</p>}

      {!status.loading && complaints.length === 0 && (
        <p>No complaints have been submitted yet.</p>
      )}

      <div className="complaint-list">
        {complaints.map((c) => (
          <div key={c.id} className="complaint-card">
            <div className="complaint-card-header">
              <h3>{c.title}</h3>
              <span className="complaint-id">{c.id}</span>
            </div>
            <p>{c.description}</p>
            <p><strong>Location:</strong> {c.location}</p>
            <p><strong>Reported by:</strong> {c.reporterName}</p>
            <p className="timestamp">
              {new Date(c.createdAt).toLocaleString()}
            </p>
            <select
              value={c.status}
              onChange={(e) => handleStatusChange(c.id, e.target.value)}
            >
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("home");
  };

  let content;
  if (page === "report") content = <ReportPage setPage={setPage} />;
  else if (page === "track") content = <TrackPage />;
  else if (page === "login") content = <LoginPage setPage={setPage} onLoginSuccess={setUser} />;
  else if (page === "dashboard") content = <DashboardPage user={user} />;
  else content = <HomePage setPage={setPage} />;

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      {content}
    </div>
  );
}

export default App;
