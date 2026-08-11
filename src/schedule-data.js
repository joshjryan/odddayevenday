window.scheduleData = {
  // Set to your school's timezone.
  timezone: "America/Denver",

  // Base calendar from the school PDF.
  // Values can be:
  // - "odd"
  // - "even"
  // - "other"
  // - { type: "other", note: "Special schedule details" }
  days: {
    "2026-08-24": "odd",
    "2026-08-25": "even",
    "2026-08-26": "odd",
    "2026-08-27": "even",
    "2026-08-28": { type: "other", note: "Assembly schedule" }
  },

  // Manual overrides always win.
  // Overrides use the same value formats as days.
  overrides: {
    // "2026-09-03": "odd",
    // "2026-09-04": { type: "other", note: "Adjusted advisory schedule" }
  },

  // Dates with no school; these dates are skipped when finding next school day.
  canceledDays: [
    // "2026-12-10"
  ],

  // Parity shift rules for future mapped school days.
  // For a +1 shift, odd/even flips for all dates >= from.
  shiftRules: [
    // { from: "2026-12-11", delta: 1, reason: "Snow day shift" }
  ]
};
