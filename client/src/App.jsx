import { useEffect, useState } from "react";
import { getApplications, addApplication, updateApplication, deleteApplication } from "./api";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationTable, { STATUSES } from "./components/ApplicationTable";
import "./App.css";

export default function App() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  async function load() {
    setApplications(await getApplications());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(data) {
    await addApplication(data);
    load();
  }

  async function handleStatusChange(id, status) {
    await updateApplication(id, { status });
    load();
  }

  async function handleDelete(id) {
    await deleteApplication(id);
    load();
  }

  const counts = {};
  applications.forEach((a) => (counts[a.status] = (counts[a.status] || 0) + 1));

  const visible = applications
    .filter((a) => filter === "All" || a.status === filter)
    .filter((a) => (a.company + " " + a.role).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container">
      <h1>Job Application Tracker</h1>

      <div className="summary">
        <strong>Total: {applications.length}</strong>
        {STATUSES.filter((s) => counts[s]).map((s) => (
          <span key={s}>{s}: {counts[s]}</span>
        ))}
      </div>

      <ApplicationForm onAdd={handleAdd} />

      <div className="filters">
        <input placeholder="Search company or role" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <ApplicationTable applications={visible} onStatusChange={handleStatusChange} onDelete={handleDelete} />
    </div>
  );
}