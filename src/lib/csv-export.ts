"use client";

export function exportToCsv(filename: string, rows: object[]) {
  if (!rows || !rows.length) {
    console.warn("No data to export.");
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const csvHeader = keys.join(separator) + '\n';
  
  const csvRows = rows.map(row => {
    return keys.map(k => {
      let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
      cell = cell instanceof Date
        ? cell.toLocaleString('pt-BR')
        : cell.toString().replace(/"/g, '""'); // Escape double quotes
      
      // If cell contains separator, newline, or double quote, enclose in double quotes
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`;
      }
      return cell;
    }).join(separator);
  }).join('\n');

  const csvContent = csvHeader + csvRows;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) { // Feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Free up memory
  } else {
    console.error("CSV download not supported by this browser.");
    // Fallback or error message
  }
}
