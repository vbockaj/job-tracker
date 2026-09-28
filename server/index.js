const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => res.send("Job tracker API is running"));

// List all
app.get("/api/applications", (req, res) => {
  res.json(readData());
});

// Add one
app.post("/api/applications", (req, res) => {
  const { company, role } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "company and role are required" });
  }
  const applications = readData();
  const newApp = {
    id: Date.now().toString(),
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
  applications.push(newApp);
  writeData(applications);
  res.status(201).json(newApp);
});

// Update one
app.put("/api/applications/:id", (req, res) => {
  const applications = readData();
  const index = applications.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  applications[index] = { ...applications[index], ...req.body, id: req.params.id };
  writeData(applications);
  res.json(applications[index]);
});

// Delete one
app.delete("/api/applications/:id", (req, res) => {
  const applications = readData();
  const filtered = applications.filter((a) => a.id !== req.params.id);
  if (filtered.length === applications.length) {
    return res.status(404).json({ error: "Not found" });
  }
  writeData(filtered);
  res.json({ deleted: req.params.id });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));