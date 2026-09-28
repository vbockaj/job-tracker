import { useState } from "react";

const empty = { company: "", role: "", link: "", source: "", notes: "" };

export default function ApplicationForm({ onAdd }) {
  const [form, setForm] = useState(empty);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    onAdd(form);
    setForm(empty);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input name="company" placeholder="Company *" value={form.company} onChange={handleChange} />
      <input name="role" placeholder="Role *" value={form.role} onChange={handleChange} />
      <input name="link" placeholder="Job link" value={form.link} onChange={handleChange} />
      <input name="source" placeholder="Found on (LinkedIn...)" value={form.source} onChange={handleChange} />
      <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
      <button type="submit">Add application</button>
    </form>
  );
}