/* Your editable data. Add entries each year from your printed panchangam / TN Govt gazette.
   Dates are YYYY-MM-DD. Everything else in the app is calculated. */

// Subha muhurtham days. type: 'valarpirai' or 'theipirai'. time is optional.
// 2026 dates: AstroVed Tamil muhurtham list (Oct matches the reference calendar app).
// Valarpirai/theipirai worked out from the tithi at Chennai sunrise.
// TODO: add Jan–Apr 2027 once the 2027 lists are published.
window.TC_MUHURTHAM = [
  // January 2026
  { date: '2026-01-28', type: 'valarpirai' },
  // February 2026
  { date: '2026-02-06', type: 'theipirai' },
  { date: '2026-02-08', type: 'theipirai' },
  { date: '2026-02-13', type: 'theipirai' },
  { date: '2026-02-15', type: 'theipirai' },
  { date: '2026-02-16', type: 'theipirai' },
  { date: '2026-02-20', type: 'valarpirai' },
  // March 2026
  { date: '2026-03-05', type: 'theipirai' },
  { date: '2026-03-06', type: 'theipirai' },
  { date: '2026-03-08', type: 'theipirai' },
  { date: '2026-03-15', type: 'theipirai' },
  { date: '2026-03-16', type: 'theipirai' },
  { date: '2026-03-25', type: 'valarpirai' },
  // April 2026
  { date: '2026-04-06', type: 'theipirai' },
  { date: '2026-04-12', type: 'theipirai' },
  { date: '2026-04-13', type: 'theipirai' },
  { date: '2026-04-16', type: 'theipirai' },
  { date: '2026-04-20', type: 'valarpirai' },
  { date: '2026-04-23', type: 'valarpirai' },
  { date: '2026-04-30', type: 'valarpirai' },
  // May 2026
  { date: '2026-05-08', type: 'theipirai' },
  { date: '2026-05-13', type: 'theipirai' },
  { date: '2026-05-14', type: 'theipirai' },
  { date: '2026-05-18', type: 'valarpirai' },
  { date: '2026-05-28', type: 'valarpirai' },
  { date: '2026-05-29', type: 'valarpirai' },
  // June 2026
  { date: '2026-06-04', type: 'theipirai' },
  { date: '2026-06-07', type: 'theipirai' },
  { date: '2026-06-17', type: 'valarpirai' },
  { date: '2026-06-18', type: 'valarpirai' },
  { date: '2026-06-24', type: 'valarpirai' },
  { date: '2026-06-25', type: 'valarpirai' },
  // July 2026
  { date: '2026-07-02', type: 'theipirai' },
  { date: '2026-07-05', type: 'theipirai' },
  { date: '2026-07-12', type: 'theipirai' },
  // August 2026
  { date: '2026-08-23', type: 'valarpirai' },
  { date: '2026-08-30', type: 'theipirai' },
  { date: '2026-08-31', type: 'theipirai' },
  // September 2026
  { date: '2026-09-07', type: 'theipirai' },
  { date: '2026-09-13', type: 'valarpirai' },
  { date: '2026-09-17', type: 'valarpirai' },
  // October 2026
  { date: '2026-10-25', type: 'valarpirai', time: '06:15 – 07:00 AM' },
  { date: '2026-10-30', type: 'theipirai' },
  // November 2026
  { date: '2026-11-01', type: 'theipirai' },
  { date: '2026-11-11', type: 'valarpirai' },
  { date: '2026-11-15', type: 'valarpirai' },
  { date: '2026-11-16', type: 'valarpirai' },
  { date: '2026-11-20', type: 'valarpirai' },
  { date: '2026-11-29', type: 'theipirai' },
  // December 2026
  { date: '2026-12-04', type: 'theipirai' },
  { date: '2026-12-06', type: 'theipirai' },
  { date: '2026-12-10', type: 'valarpirai' },
  { date: '2026-12-13', type: 'valarpirai' },
  { date: '2026-12-14', type: 'valarpirai' },
];

// Holidays that can't be calculated reliably (moon-sighting based, or set by the TN Govt each year).
// Example: { date: '2027-03-10', name: 'ரம்ஜான்' },
window.TC_EXTRA_HOLIDAYS = [
];
