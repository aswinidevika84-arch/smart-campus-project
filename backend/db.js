const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DB_DIR, "users.json");
const COMPLAINTS_FILE = path.join(DB_DIR, "complaints.json");

function ensureDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
  }

  if (!fs.existsSync(COMPLAINTS_FILE)) {
    fs.writeFileSync(COMPLAINTS_FILE, "[]");
  }
}

function readJson(file) {
  ensureDb();

  const raw = fs.readFileSync(file, "utf-8");

  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJson(file, data) {
  ensureDb();

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );
}

module.exports = {
  ensureDb,

  getUsers: () => readJson(USERS_FILE),

  saveUsers: (users) => writeJson(USERS_FILE, users),

  getComplaints: () => readJson(COMPLAINTS_FILE),

  saveComplaints: (complaints) =>
    writeJson(COMPLAINTS_FILE, complaints),
};