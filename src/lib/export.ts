export function stripMarkdown(md: string) {
  return md
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, "")
    .replace(/\|/g, "  ");
}

export async function exportPdf(title: string, content: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const height = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`AI Workplace Productivity Assistant · ${new Date().toLocaleString()}`, margin, 78);
  doc.setFontSize(11);
  let y = 104;
  for (const line of doc.splitTextToSize(stripMarkdown(content), width) as string[]) {
    if (y > height - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 15;
  }
  doc.text("AI-generated content — verify before use.", margin, height - 25);
  doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}

export function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
