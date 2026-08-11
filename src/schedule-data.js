window.scheduleData = {
  // Set to your school's timezone.
  timezone: "America/Denver",

  // Base calendar from the school PDF.
  // Values can be:
  // - "odd"
  // - "even"
  // - "other"
  // - { type: "other", note: "Special schedule details", school: false }
  days: {
    "2026-08-12": { type: "other", note: "District Professional Learning Day", school: false },
    "2026-08-18": { type: "other", note: "Transition Day (6th and 9th grade only)", school: true },
    "2026-08-19": "odd",
    "2026-08-20": "even",
    "2026-08-21": "odd",
    "2026-08-23": "even",
    "2026-08-24": "even",
    "2026-08-25": "odd",
    "2026-08-26": "even",
    "2026-08-27": "odd",
    "2026-08-28": "even",
    "2026-08-31": "odd",
    "2026-09-01": "even",
    "2026-09-02": "odd",
    "2026-09-03": "even",
    "2026-09-04": "odd",
    "2026-09-08": "even",
    "2026-09-09": "odd",
    "2026-09-10": "even",
    "2026-09-11": "odd",
    "2026-09-14": "even",
    "2026-09-15": "odd",
    "2026-09-16": "even",
    "2026-09-17": "odd",
    "2026-09-18": "even",
    "2026-09-21": "odd",
    "2026-09-22": "even",
    "2026-09-23": "odd",
    "2026-09-24": "even",
    "2026-09-25": "odd",
    "2026-09-28": "even",
    "2026-09-29": "odd",
    "2026-09-30": "even"
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
