/**
 * Formats a Date or date-like value into a local date string (YYYY-MM-DD)
 * using local year, month, and date (preventing UTC timezone shift bugs).
 */
export function getLocalDateString(inputDate = new Date()) {
  const d = inputDate instanceof Date ? inputDate : new Date(inputDate);
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const yr = fallback.getFullYear();
    const mo = String(fallback.getMonth() + 1).padStart(2, '0');
    const da = String(fallback.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an array of YYYY-MM-DD date strings for the current week (Sun-Sat).
 */
export function getCurrentWeekDates(today = new Date()) {
  const todayIndex = today.getDay(); // 0 = Sun ... 6 = Sat
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (todayIndex - i));
    dates.push(getLocalDateString(d));
  }
  return dates;
}
