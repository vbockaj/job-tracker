import { useState } from "react";
import { STATUSES } from "./ApplicationTable";

const empty = {
  company: "", role: "", link: "", source: "", status: "Applied",
  nextStep: "", nextStepDate: "", notes: "",
};

export default function ApplicationForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || empty);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    onSubmit(form);
    if (!initial) setForm(empty);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input name="company" placeholder="Company *" value={form.company} onChange={handleChange} />
      <input name="role" placeholder="Role *" value={form.role} onChange={handleChange} />
      <input name="link" placeholder="Job link" value={form.link} onChange={handleChange} />
      <input name="source" placeholder="Found on (LinkedIn...)" value={form.source} onChange={handleChange} />
      {initial && (
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      )}
      <input name="nextStep" placeholder="Next step (e.g. Follow up call)" value={form.nextStep} onChange={handleChange} />
      <input type="date" name="nextStepDate" value={form.nextStepDate} onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} rows={2} />
      <div className="form-actions">
        <button type="submit">{initial ? "Save changes" : "Add application"}</button>
        {initial && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}