/**
 * Format a date string (YYYY-MM-DD or ISO) into human-readable format.
 * Examples:
 *   formatDateDisplay('2026-07-24', 'id') -> '24 Juli 2026'
 *   formatDateDisplay('2026-07-24', 'en') -> '24 July 2026'
 */
export const formatDateDisplay = (dateString, lang = 'id') => {
  if (!dateString) return '';

  // Handle YYYY-MM-DD format explicitly to avoid UTC timezone offset shifts
  const parts = dateString.split('T')[0].split('-');
  let dateObj;
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    dateObj = new Date(year, month, day);
  } else {
    dateObj = new Date(dateString);
  }

  if (isNaN(dateObj.getTime())) return dateString;

  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  const monthsID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthsEN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isIndonesian = !lang || lang.startsWith('id') || lang === 'id' || lang === 'Bahasa Indonesia';
  const monthName = isIndonesian ? monthsID[dateObj.getMonth()] : monthsEN[dateObj.getMonth()];

  return `${day} ${monthName} ${year}`;
};
