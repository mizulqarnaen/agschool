export const generateCSV = (data, headers) => {
  if (!data || !data.length) return '';

  const keys = Object.keys(headers);
  const headerRow = Object.values(headers).join(',');

  const rows = data.map(item => {
    return keys.map(key => {
      let val = item[key] !== undefined && item[key] !== null ? item[key] : '';
      // Escape quotes and wrap text in quotes
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
};
