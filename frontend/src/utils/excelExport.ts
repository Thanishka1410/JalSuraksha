/**
 * Excel / CSV export utility for JalRakshak AI
 * Uses SheetJS (xlsx) when available, falls back to CSV download.
 */

type Row = Record<string, string | number | boolean | null | undefined>;

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports an array of objects to an Excel (.xlsx) file.
 * Falls back to CSV if xlsx library is not available.
 */
export const exportToExcel = async (
  rows: Row[],
  sheetName: string,
  filename: string
): Promise<void> => {
  const safeName = filename.replace(/\s+/g, '_').toLowerCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  try {
    // Dynamically import xlsx so the bundle only includes it if present
    // @ts-ignore: Optional dependency, safe to ignore if missing since we fall back to CSV
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `jalrakshak_${safeName}_${dateStr}.xlsx`);
  } catch {
    // Fallback: export as CSV
    exportToCSV(rows, `${safeName}_${dateStr}`);
  }
};

/**
 * Exports data as a plain CSV file (no extra dependencies).
 */
export const exportToCSV = (rows: Row[], filename: string): void => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (val: unknown): string => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `jalrakshak_${filename}.csv`);
};

/* ── Helpers for specific export types ───────────────────────────── */

export const exportComplaintsToExcel = (complaints: any[]): void => {
  const rows = complaints.map(c => ({
    'Complaint ID': c._id?.slice(-8)?.toUpperCase() || '',
    'Category': c.category?.replace(/_/g, ' ')?.toUpperCase() || '',
    'Priority': c.priority?.toUpperCase() || '',
    'Status': c.status?.replace(/_/g, ' ')?.toUpperCase() || '',
    'Description': c.description || '',
    'Village': typeof c.village === 'object' ? c.village?.name : c.village || '',
    'Complainant': typeof c.complainant === 'object' ? c.complainant?.name : '',
    'Assigned To': typeof c.assignedTo === 'object' ? c.assignedTo?.name : '',
    'Created At': c.createdAt ? new Date(c.createdAt).toLocaleString('en-IN') : '',
    'Resolved At': c.resolvedAt ? new Date(c.resolvedAt).toLocaleString('en-IN') : '',
    'Resolution Notes': c.resolutionNotes || '',
  }));
  exportToExcel(rows, 'Complaints', 'complaints_report');
};

export const exportWaterQualityToExcel = (records: any[]): void => {
  const rows = records.map(r => ({
    'Village': typeof r.village === 'object' ? r.village?.name : r.village || '',
    'Sample Date': r.sampleDate ? new Date(r.sampleDate).toLocaleDateString('en-IN') : '',
    'Status': r.overallStatus?.replace(/_/g, ' ')?.toUpperCase() || '',
    'pH': r.parameters?.pH ?? '',
    'TDS (ppm)': r.parameters?.TDS ?? '',
    'Turbidity (NTU)': r.parameters?.turbidity ?? '',
    'Chlorine (mg/L)': r.parameters?.chlorine ?? '',
    'Fluoride (mg/L)': r.parameters?.fluoride ?? '',
    'Recommendations': (r.recommendations || []).join('; '),
    'Recorded By': typeof r.recordedBy === 'object' ? r.recordedBy?.name : '',
  }));
  exportToExcel(rows, 'Water Quality', 'water_quality_report');
};

export const exportMaintenanceToExcel = (logs: any[]): void => {
  const rows = logs.map(l => ({
    'Maintenance ID': l._id?.slice(-8)?.toUpperCase() || '',
    'Type': l.type?.toUpperCase() || '',
    'Description': l.description || '',
    'Asset': typeof l.pump === 'object' ? l.pump?.name : (typeof l.tank === 'object' ? l.tank?.name : ''),
    'Performed By': typeof l.performedBy === 'object' ? l.performedBy?.name : '',
    'Village': typeof l.village === 'object' ? l.village?.name : l.village || '',
    'Total Cost (₹)': l.totalCost ?? '',
    'Status': l.status?.toUpperCase() || '',
    'Start Time': l.startTime ? new Date(l.startTime).toLocaleString('en-IN') : '',
    'End Time': l.endTime ? new Date(l.endTime).toLocaleString('en-IN') : '',
    'Next Maintenance': l.nextMaintenanceDate ? new Date(l.nextMaintenanceDate).toLocaleDateString('en-IN') : '',
  }));
  exportToExcel(rows, 'Maintenance', 'maintenance_report');
};
