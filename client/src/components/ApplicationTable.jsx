export const STATUSES = [
  "Saved", "Applied", "Screening call", "Interview", "Task/Assessment",
  "Offer", "Rejected", "Withdrawn", "Ghosted",
];

export function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function reminderInfo(app) {
  const until = daysUntil(app.nextStepDate);
  if (until !== null) {
    if (until < 0) return { text: "Overdue", level: "danger" };
    if (until <= 3) return { text: until === 0 ? "Due today" : `Due in ${until}d`, level: "warn" };
  }
  const since = daysSince(app.dateApplied);
  if (since === null) return null;
  if (app.status === "Applied" && since > 7) return { text: "Follow up", level: "warn" };
  if (["Screening call", "Interview", "Task/Assessment"].includes(app.status) && since > 14) {
    return { text: "Stale", level: "warn" };
  }
  return null;
}

export default function ApplicationTable({ applications, onStatusChange, onDelete, onEdit, sortBy, sortDir, onSortChange }) {
  if (applications.length === 0) {
  return (
    <div className="empty-state">
      <p>No applications yet — add your first one above.</p>
    </div>
  );
}

  function header(label, key) {
    const active = sortBy === key;
    return (
      <th onClick={() => onSortChange(key)}>
        {label} {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </th>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          {header("Company", "company")}
          {header("Role", "role")}
          <th>Source</th>
          {header("Applied", "dateApplied")}
          {header("Status", "status")}
          <th>Next step</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => {
          const flag = reminderInfo(app);
          return (
            <tr key={app.id} className={`row-${app.status.replace(/\W/g, "").toLowerCase()}`}>
              <td>
                {app.link ? <a href={app.link} target="_blank" rel="noreferrer">{app.company}</a> : app.company}
              </td>
              <td>{app.role}</td>
              <td>{app.source}</td>
              <td>{app.dateApplied}</td>
              <td>
                <select value={app.status} onChange={(e) => onStatusChange(app.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                {app.nextStep && <div className="next-step-text">{app.nextStep}</div>}
                {app.nextStepDate && <div className="next-step-date">{app.nextStepDate}</div>}
                {flag && <span className={`badge badge-${flag.level}`}>{flag.text}</span>}
              </td>
              <td className="row-actions">
                <button className="secondary" onClick={() => onEdit(app)}>Edit</button>
                <button className="danger" onClick={() => onDelete(app.id)}>Delete</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}