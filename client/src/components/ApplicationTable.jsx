export const STATUSES = [
  "Saved", "Applied", "Screening call", "Interview", "Task/Assessment",
  "Offer", "Rejected", "Withdrawn", "Ghosted",
];

function needsFollowUp(app) {
  if (app.status !== "Applied" || !app.dateApplied) return false;
  const days = (Date.now() - new Date(app.dateApplied).getTime()) / 86400000;
  return days > 7;
}

export default function ApplicationTable({ applications, onStatusChange, onDelete }) {
  if (applications.length === 0) return <p>No applications yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Source</th>
          <th>Applied</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
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
              {needsFollowUp(app) && <span className="badge">Follow up</span>}
            </td>
            <td>
              <button onClick={() => onDelete(app.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}