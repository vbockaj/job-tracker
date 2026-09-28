import { useEffect, useState } from "react";
import { getApplications, addApplication, updateApplication, deleteApplication } from "./api";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationTable, { STATUSES } from "./components/ApplicationTable";
import KanbanBoard from "./components/KanbanBoard";
import AuthForm from "./components/AuthForm";
import Modal from "./components/Modal";
import { exportToCsv } from "./csv";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [sortBy, setSortBy] = useState("dateApplied");
  const [sortDir, setSortDir] = useState("desc");
  const [editingApp, setEditingApp] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  async function load() {
    try {
      setApplications(await getApplications());
    } catch {
      handleLogout();
    }
  }

  useEffect(() => {
    if (email) load();
  }, [email]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setEmail(null);
    setApplications([]);
  }

  if (!email) {
    return <AuthForm onAuth={setEmail} theme={theme} onToggleTheme={toggleTheme} />;
  }

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

  async function handleEditSubmit(data) {
    await updateApplication(editingApp.id, data);
    setEditingApp(null);
    load();
  }

  function handleSortChange(key) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const counts = {};
  applications.forEach((a) => (counts[a.status] = (counts[a.status] || 0) + 1));

  let visible = applications
    .filter((a) => filter === "All" || a.status === filter)
    .filter((a) => (a.company + " " + a.role).toLowerCase().includes(search.toLowerCase()));

  visible = [...visible].sort((a, b) => {
    const av = (a[sortBy] || "").toString().toLowerCase();
    const bv = (b[sortBy] || "").toString().toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="container">
      <div className="topbar">
        <h1>Job Application Tracker</h1>
        <div className="topbar-right">
          <button className="icon-button" onClick={toggleTheme} title="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="user-avatar">{email[0].toUpperCase()}</span>
          <span className="user-email">{email}</span>
          <button className="secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="summary">
        <strong>Total: {applications.length}</strong>
        {STATUSES.filter((s) => counts[s]).map((s) => (
          <span key={s}>{s}: {counts[s]}</span>
        ))}
      </div>

      <h2 className="section-title">Add a new application</h2>
      <ApplicationForm onSubmit={handleAdd} />

      <div className="filters">
        <input placeholder="Search company or role" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="secondary" onClick={() => setView(view === "table" ? "kanban" : "table")}>
          {view === "table" ? "Kanban view" : "Table view"}
        </button>
        <button className="secondary" onClick={() => exportToCsv(applications)}>Export CSV</button>
      </div>

      {view === "table" ? (
        <ApplicationTable
          applications={visible}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={setEditingApp}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
      ) : (
        <KanbanBoard
          applications={visible}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={setEditingApp}
        />
      )}

      {editingApp && (
        <Modal title="Edit application" onClose={() => setEditingApp(null)}>
          <ApplicationForm initial={editingApp} onSubmit={handleEditSubmit} onCancel={() => setEditingApp(null)} />
        </Modal>
      )}
    </div>
  );
}