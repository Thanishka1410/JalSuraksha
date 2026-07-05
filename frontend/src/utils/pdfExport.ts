import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Exports a DOM element to a styled PDF report.
 * @param elementId - The id of the HTML element to capture
 * @param options   - Report title, subtitle and output filename
 */
export const exportToPDF = async (
  elementId: string,
  options: PDFReportOptions
): Promise<void> => {
  const { title, subtitle = 'JalSuraksha AI — Rural Water Supply Monitoring', filename } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Capture the DOM element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 10;
  const headerHeight = 28;

  // ── Header bar ──────────────────────────────────────────────
  pdf.setFillColor(14, 165, 233); // sky-500 (primary colour)
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');

  // Logo / title text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('💧 JalSuraksha AI', marginX, 11);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, marginX, 18);

  // Report title on the right
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth - marginX, 11, { align: 'right' });

  // Timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${timestamp}`, pageWidth - marginX, 18, { align: 'right' });

  // ── Report Image ─────────────────────────────────────────────
  const imgW = pageWidth - marginX * 2;
  const imgH = (canvas.height * imgW) / canvas.width;
  const contentY = headerHeight + 5;
  const maxContentH = pageHeight - contentY - 10;

  if (imgH <= maxContentH) {
    pdf.addImage(imgData, 'PNG', marginX, contentY, imgW, imgH);
  } else {
    // Split across multiple pages if content is tall
    let remainingH = imgH;
    let yOffset = 0;
    let isFirstPage = true;

    while (remainingH > 0) {
      const sliceH = Math.min(maxContentH, remainingH);
      const sliceRatio = sliceH / imgH;

      if (!isFirstPage) {
        pdf.addPage();
        // repeat header on subsequent pages
        pdf.setFillColor(14, 165, 233);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${title} (continued)`, marginX, 8);
      }

      const srcY = yOffset;
      const destY = isFirstPage ? contentY : 15;
      const srcH = (sliceRatio * canvas.height);

      // Create a temporary canvas slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = srcH;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, srcY * (canvas.height / imgH), canvas.width, srcH, 0, 0, canvas.width, srcH);
      const sliceData = sliceCanvas.toDataURL('image/png');

      pdf.addImage(sliceData, 'PNG', marginX, destY, imgW, sliceH);

      yOffset += sliceH;
      remainingH -= sliceH;
      isFirstPage = false;
    }
  }

  // ── Footer ───────────────────────────────────────────────────
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    'JalSuraksha AI | Jal Jeevan Mission | Government of India',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  // Save
  const safeName = (filename || title).replace(/\s+/g, '_').toLowerCase();
  pdf.save(`JalSuraksha_${safeName}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`);
};
