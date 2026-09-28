export function exportToCsv(applications) {
  const headers = ["company", "role", "link", "source", "dateApplied", "status", "nextStep", "nextStepDate", "contact", "cvVersion", "notes"];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = applications.map((a) => headers.map((h) => escape(a[h])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}