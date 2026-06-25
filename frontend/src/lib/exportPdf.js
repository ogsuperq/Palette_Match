import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Captures every .pdf-page inside the export root and builds a landscape PDF.
export async function exportDeckToPdf(rootId = "pdf-export-root", filename = "palette-match-pitch-deck.pdf") {
  const root = document.getElementById(rootId);
  if (!root) return;
  const pages = Array.from(root.querySelectorAll(".pdf-page"));
  if (!pages.length) return;

  root.style.display = "block";
  // allow layout + images to settle
  await new Promise((res) => setTimeout(res, 350));

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 1280,
      height: 720,
      windowWidth: 1280,
      windowHeight: 720,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage([1280, 720], "landscape");
    pdf.addImage(img, "JPEG", 0, 0, 1280, 720);
  }

  root.style.display = "none";
  pdf.save(filename);
}
