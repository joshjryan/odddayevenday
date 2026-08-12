const scheduleData = window.scheduleData;

const todayDateEl = document.getElementById("today-date");
const todayParityEl = document.getElementById("today-parity");
const nextSchoolDayEl = document.getElementById("next-school-day");
const nextParityEl = document.getElementById("next-parity");
const statusEl = document.getElementById("status");
const cardEl = document.querySelector(".card");

function getThemeKey(dayEntry) {
  if (!dayEntry) {
    return "other";
  }

  if (dayEntry.school === false) {
    return "no-school";
  }

  return dayEntry.type;
}

function getISODateInTimezone(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function toPrettyDate(isoDate, _timeZone) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    // Keep the rendered calendar day aligned to the ISO date.
    // Using the school timezone here can shift dates back/forward a day.
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(utcDate);
}

function addDaysToISODate(isoDate, daysToAdd) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + daysToAdd);

  return utcDate.toISOString().slice(0, 10);
}

function isCanceledDay(isoDate, canceledDaysSet) {
  return canceledDaysSet.has(isoDate);
}

function normalizeDayEntry(value) {
  if (value === "odd" || value === "even" || value === "other") {
    return { type: value, note: "", school: true };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const type = value.type;
  if (type !== "odd" && type !== "even" && type !== "other") {
    return null;
  }

  const note = typeof value.note === "string" ? value.note.trim() : "";
  const school = value.school === false ? false : true;
  return { type, note, school };
}

function applyShift(dayEntry, shiftDelta) {
  if (!dayEntry) {
    return null;
  }

  if (dayEntry.type === "other" || shiftDelta % 2 === 0) {
    return dayEntry;
  }

  return {
    ...dayEntry,
    type: dayEntry.type === "odd" ? "even" : "odd"
  };
}

function resolveDayEntry(isoDate, data, canceledDaysSet) {
  if (isCanceledDay(isoDate, canceledDaysSet)) {
    return null;
  }

  const overrideEntry = normalizeDayEntry(data.overrides[isoDate]);
  if (overrideEntry) {
    return overrideEntry;
  }

  const baseEntry = normalizeDayEntry(data.days[isoDate]);
  if (!baseEntry) {
    return null;
  }

  const totalShift = data.shiftRules
    .filter((rule) => typeof rule.from === "string" && isoDate >= rule.from)
    .reduce((sum, rule) => sum + (Number(rule.delta) || 0), 0);

  return applyShift(baseEntry, totalShift);
}

function findNextSchoolDay(todayIso, data, canceledDaysSet) {
  const schoolDates = Object.keys(data.days).sort();

  for (const schoolDate of schoolDates) {
    if (schoolDate <= todayIso) {
      continue;
    }

    const entry = resolveDayEntry(schoolDate, data, canceledDaysSet);
    if (entry && entry.school !== false) {
      return { date: schoolDate, entry };
    }
  }

  return null;
}

function setDayTypeStyle(element, dayEntry) {
  element.classList.remove("odd", "even", "other", "no-school");

  if (!dayEntry) {
    return;
  }

  if (dayEntry.school === false) {
    element.classList.add("no-school");
    return;
  }

  if (dayEntry.type === "odd" || dayEntry.type === "even" || dayEntry.type === "other") {
    element.classList.add(dayEntry.type);
  }
}

function applyTheme(dayEntry, showingNextDay) {
  const themeKey = getThemeKey(dayEntry);
  document.body.dataset.dayTheme = themeKey;
  document.body.dataset.themeSource = showingNextDay ? "next" : "today";

  if (cardEl) {
    cardEl.dataset.note = showingNextDay ? "Next school day" : "Today";
  }
}

function formatDayTypeLabel(dayEntry) {
  if (dayEntry.school === false) {
    return "NO SCHOOL";
  }

  return dayEntry.type.toUpperCase();
}

function render() {
  if (!scheduleData || !scheduleData.days) {
    statusEl.textContent =
      "Schedule data missing. Check schedule-data.js and refresh.";
    return;
  }

  const { timezone } = scheduleData;
  const todayIso = getISODateInTimezone(new Date(), timezone);
  const canceledDaysSet = new Set(scheduleData.canceledDays);

  const todayEntry = resolveDayEntry(todayIso, scheduleData, canceledDaysSet);
  const nextSchoolDay = findNextSchoolDay(todayIso, scheduleData, canceledDaysSet);
  const themeEntry = todayEntry || nextSchoolDay?.entry || null;

  todayDateEl.textContent = toPrettyDate(todayIso, timezone);
  applyTheme(themeEntry, !todayEntry && Boolean(nextSchoolDay));

  if (todayEntry) {
    todayParityEl.textContent = formatDayTypeLabel(todayEntry);
    setDayTypeStyle(todayParityEl, todayEntry);
  } else {
    todayParityEl.textContent = "No school scheduled";
    setDayTypeStyle(todayParityEl, null);
  }

  if (nextSchoolDay) {
    nextSchoolDayEl.textContent = toPrettyDate(nextSchoolDay.date, timezone);
    nextParityEl.textContent = formatDayTypeLabel(nextSchoolDay.entry);
    setDayTypeStyle(nextParityEl, nextSchoolDay.entry);

    const notes = [];
    if (todayEntry?.note) {
      notes.push(`Today note: ${todayEntry.note}`);
    }
    if (nextSchoolDay.entry.note) {
      notes.push(`Next day note: ${nextSchoolDay.entry.note}`);
    }
    statusEl.textContent = notes.join(" | ");
  } else {
    nextSchoolDayEl.textContent = "Not found";
    nextParityEl.textContent = "--";
    setDayTypeStyle(nextParityEl, null);
    statusEl.textContent =
      "No upcoming school day found in data. Add more dates to scheduleData.days.";
  }
}

render();
