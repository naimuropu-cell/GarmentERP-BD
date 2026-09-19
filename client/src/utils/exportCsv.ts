/**
 * Enterprise CSV Exporter Utility
 * Generates RFC 4180 compliant CSV files with UTF-8 BOM for Microsoft Excel compatibility.
 */
export const exportToCsv = (filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) => {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays special chars and formatting cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
