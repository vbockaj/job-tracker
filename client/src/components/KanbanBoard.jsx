import { STATUSES, reminderInfo } from "./ApplicationTable";

export default function KanbanBoard({ applications, onStatusChange, onDelete, onEdit }) {
  function handleDrop(e, status) {
    const id = e.dataTransfer.getData("text/plain");
    onStatusChange(id, status);
  }

  return (
    <div className="kanban">
      {STATUSES.map((status) => (
        <div
          key={status}
          className="kanban-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h3>{status} ({applications.filter((a) => a.status === status).length})</h3>
          {applications.filter((a) => a.status === status).map((app) => {
            const flag = reminderInfo(app);
            return (
              <div
                key={app.id}
                className="kanban-card"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", app.id)}
              >
                <strong>{app.company}</strong>
                <div>{app.role}</div>
                {flag && <span className={`badge badge-${flag.level}`}>{flag.text}</span>}
                <div className="kanban-card-actions">
                  <button className="secondary" onClick={() => onEdit(app)}>Edit</button>
                  <button className="danger" onClick={() => onDelete(app.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}