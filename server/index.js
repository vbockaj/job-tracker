const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3001;
const JWT_SECRET = "replace-this-with-a-long-random-string";
const db = new Database(path.join(__dirname, "applications.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    link TEXT DEFAULT '',
    source TEXT DEFAULT '',
    dateApplied TEXT,
    status TEXT DEFAULT 'Applied',
    nextStep TEXT DEFAULT '',
    nextStepDate TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    cvVersion TEXT DEFAULT '',
    notes TEXT DEFAULT ''
  )
`);

app.use(cors());
app.use(express.json());

function isStrongPassword(password) {
  return typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);
}

const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const match = email.trim().toLowerCase().match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!match) return false;
  const domain = match[1];
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => res.send("Job tracker API is running"));

app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
    if (!isValidEmail(email)) {
    return res.status(400).json({ error: "please use a valid Gmail, Hotmail, Outlook, Yahoo, or iCloud address" });
  }
   if (!isStrongPassword(password)) {
    return res.status(400).json({ error: "password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: Date.now().toString(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.prepare("INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)")
    .run(user.id, user.email, user.passwordHash, user.createdAt);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, email: user.email });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: user.email });
});

app.get("/api/applications", auth, (req, res) => {
  const rows = db.prepare("SELECT * FROM applications WHERE userId = ? ORDER BY dateApplied DESC").all(req.userId);
  res.json(rows);
});

app.post("/api/applications", auth, (req, res) => {
  const { company, role } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "company and role are required" });
  }
  const newApp = {
    id: Date.now().toString(),
    userId: req.userId,
    company,
    role,
    link: req.body.link || "",
    source: req.body.source || "",
    dateApplied: req.body.dateApplied || new Date().toISOString().slice(0, 10),
    status: req.body.status || "Applied",
    nextStep: req.body.nextStep || "",
    nextStepDate: req.body.nextStepDate || "",
    contact: req.body.contact || "",
    cvVersion: req.body.cvVersion || "",
    notes: req.body.notes || "",
  };
  db.prepare(`
    INSERT INTO applications (id, userId, company, role, link, source, dateApplied, status, nextStep, nextStepDate, contact, cvVersion, notes)
    VALUES (@id, @userId, @company, @role, @link, @source, @dateApplied, @status, @nextStep, @nextStepDate, @contact, @cvVersion, @notes)
  `).run(newApp);
  res.status(201).json(newApp);
});

app.put("/api/applications/:id", auth, (req, res) => {
  const existing = db.prepare("SELECT * FROM applications WHERE id = ? AND userId = ?").get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const updated = { ...existing, ...req.body, id: req.params.id, userId: req.userId };
  db.prepare(`
    UPDATE applications SET company=@company, role=@role, link=@link, source=@source,
      dateApplied=@dateApplied, status=@status, nextStep=@nextStep, nextStepDate=@nextStepDate,
      contact=@contact, cvVersion=@cvVersion, notes=@notes WHERE id=@id AND userId=@userId
  `).run(updated);
  res.json(updated);
});

app.delete("/api/applications/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM applications WHERE id = ? AND userId = ?").run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: "Not found" });
  res.json({ deleted: req.params.id });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));