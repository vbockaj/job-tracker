const express = require("express");
const app = express();
app.use(express.json());

const applications = [
  { id: 1, company: "Test Co", role: "Frontend Dev", status: "Applied" }
];

app.get("/api/applications", (req, res) => res.json(applications));

app.listen(3000, () => console.log("Running on http://localhost:3000"));