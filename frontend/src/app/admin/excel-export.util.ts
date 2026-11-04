/**
 * Utilitaire d'exportation Excel / CSV compatible avec Microsoft Excel, LibreOffice et Google Sheets.
 * Utilise le préfixe UTF-8 BOM (\uFEFF) et le délimiteur point-virgule (;) pour préserver
 * tous les accents français et caractères spéciaux sous Windows et Mac.
 */
export function exportToExcelCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((row) => row.map(escapeCsv).join(';')),
  ].join('\r\n');

  // \uFEFF garantit qu'Excel lit le fichier en UTF-8 avec accents sans distorsion
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
