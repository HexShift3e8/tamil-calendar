/* Your editable data. Add entries each year from your printed panchangam / TN Govt gazette.
   Dates are YYYY-MM-DD. Everything else in the app is calculated. */

// Subha muhurtham days. type: 'valarpirai' or 'theipirai'. time is optional.
window.TC_MUHURTHAM = [
  { date: '2026-10-25', type: 'valarpirai', time: '06:15 – 07:00 AM' },
  { date: '2026-10-30', type: 'theipirai' },
];

// Holidays that can't be calculated reliably (moon-sighting based, or set by the TN Govt each year).
// Example: { date: '2027-03-10', name: 'ரம்ஜான்' },
window.TC_EXTRA_HOLIDAYS = [
];
