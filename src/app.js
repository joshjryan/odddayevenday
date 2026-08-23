const scheduleData = window.scheduleData;

const todayDateEl = document.getElementById("today-date");
const todayContextEl = document.getElementById("today-context");
const todayParityEl = document.getElementById("today-parity");
const todayNoteEl = document.getElementById("today-note");
const nextSchoolDayEl = document.getElementById("next-school-day");
const nextRelativeEl = document.getElementById("next-relative");
const nextSchoolDayCountEl = document.getElementById("next-school-day-count");
const nextParityEl = document.getElementById("next-parity");
const nextOtherNoteRowEl = document.getElementById("next-other-note-row");
const nextOtherNoteEl = document.getElementById("next-other-note");
const upcomingGlanceEl = document.getElementById("upcoming-glance");
const upcomingListEl = document.getElementById("upcoming-list");
const statusEl = document.getElementById("status");
const cardEl = document.querySelector ? document.querySelector(".card") : null;

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

function toShortDateLabel(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(utcDate);
}

function parseISODateToUTCMillis(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getCalendarDayDelta(fromIsoDate, toIsoDate) {
  const millisPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseISODateToUTCMillis(toIsoDate) - parseISODateToUTCMillis(fromIsoDate)) / millisPerDay);
}

function formatRelativeDay(fromIsoDate, toIsoDate) {
  const dayDelta = getCalendarDayDelta(fromIsoDate, toIsoDate);

  if (dayDelta <= 0) {
    return "Today";
  }

  if (dayDelta === 1) {
    return "Tomorrow";
  }

  return `In ${dayDelta} days`;
}

function formatSchoolDayCount(count) {
  if (count <= 0) {
    return "Today";
  }

  if (count === 1) {
    return "1 day away";
  }

  return `${count} days away`;
}

function setText(element, text) {
  if (!element) {
    return;
  }

  element.textContent = text;
}

function clearChildren(element) {
  if (!element) {
    return;
  }

  element.textContent = "";
}

function setHidden(element, isHidden) {
  if (!element) {
    return;
  }

  element.hidden = isHidden;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (typeof text === "string") {
    element.textContent = text;
  }
  return element;
}

function appendChip(container, label, dayEntry) {
  if (!container) {
    return;
  }

  const chip = createElement("span", "chip", label);
  if (dayEntry && dayEntry.type) {
    chip.classList.add(dayEntry.type);
  }
  if (dayEntry && dayEntry.school === false) {
    chip.classList.add("no-school");
  }
  chip.setAttribute("role", "listitem");
  container.appendChild(chip);
}

function appendListItem(container, text) {
  if (!container) {
    return;
  }

  container.appendChild(createElement("li", "", text));
}

function findUpcomingSchoolDays(todayIso, data, canceledDaysSet, limit = 7) {
  const schoolDates = Object.keys(data.days).sort();
  const upcoming = [];

  for (const schoolDate of schoolDates) {
    if (schoolDate < todayIso) {
      continue;
    }

    const entry = resolveDayEntry(schoolDate, data, canceledDaysSet);
    if (!entry || entry.school === false) {
      continue;
    }

    upcoming.push({ date: schoolDate, entry });
    if (upcoming.length >= limit) {
      break;
    }
  }

  return upcoming;
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
  if (!element || !element.classList) {
    return;
  }

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
  if (document.body) {
    document.body.dataset.dayTheme = themeKey;
    document.body.dataset.themeSource = showingNextDay ? "next" : "today";
  }

  if (cardEl) {
    cardEl.dataset.note = showingNextDay ? "Next school day" : "Today";
  }
}

function formatDayTypeLabel(dayEntry) {
  if (!dayEntry) {
    return "NO SCHOOL";
  }

  if (dayEntry.school === false) {
    if (dayEntry.type === "other") {
      return "NO SCHOOL (OTHER)";
    }

    return "NO SCHOOL";
  }

  return dayEntry.type.toUpperCase();
}

function render() {
  if (!scheduleData || !scheduleData.days) {
    setText(statusEl, "Schedule data missing. Check schedule-data.js and refresh.");
    return;
  }

  const { timezone } = scheduleData;
  const todayIso = getISODateInTimezone(new Date(), timezone);
  const canceledDaysSet = new Set(scheduleData.canceledDays);

  const todayEntry = resolveDayEntry(todayIso, scheduleData, canceledDaysSet);
  const nextSchoolDay = findNextSchoolDay(todayIso, scheduleData, canceledDaysSet);
  setText(todayContextEl, "Today");
  setText(todayDateEl, toPrettyDate(todayIso, timezone));
  applyTheme(todayEntry || nextSchoolDay?.entry || null, false);
  setText(todayParityEl, formatDayTypeLabel(todayEntry));
  setDayTypeStyle(todayParityEl, todayEntry);

  if (todayEntry?.note) {
    setText(todayNoteEl, todayEntry.note);
  } else {
    setText(todayNoteEl, "");
  }

  if (nextSchoolDay) {
    const dayCount = getCalendarDayDelta(todayIso, nextSchoolDay.date);
    const isOtherDay = nextSchoolDay.entry.type === "other";
    const hasOtherNote = isOtherDay && Boolean(nextSchoolDay.entry.note);

    setText(nextSchoolDayEl, toPrettyDate(nextSchoolDay.date, timezone));
    setText(nextRelativeEl, formatRelativeDay(todayIso, nextSchoolDay.date));
    setText(nextSchoolDayCountEl, formatSchoolDayCount(dayCount));
    setText(nextParityEl, formatDayTypeLabel(nextSchoolDay.entry));
    setDayTypeStyle(nextParityEl, nextSchoolDay.entry);
    setText(nextOtherNoteEl, hasOtherNote ? nextSchoolDay.entry.note : "");
    setHidden(nextOtherNoteRowEl, hasOtherNote);

    setText(statusEl, nextSchoolDay.entry.note ? `Next: ${nextSchoolDay.entry.note}` : "");
  } else {
    setText(nextSchoolDayEl, "Not found");
    setText(nextRelativeEl, "--");
    setText(nextSchoolDayCountEl, "--");
    setText(nextParityEl, "--");
    setDayTypeStyle(nextParityEl, null);
    setText(nextOtherNoteEl, "");
    setHidden(nextOtherNoteRowEl, true);
    setText(statusEl, "No upcoming school day found in data. Add more dates to scheduleData.days.");
  }

  const upcomingSchoolDays = findUpcomingSchoolDays(todayIso, scheduleData, canceledDaysSet, 7);
  clearChildren(upcomingGlanceEl);
  clearChildren(upcomingListEl);

  if (upcomingSchoolDays.length === 0) {
    appendChip(upcomingGlanceEl, "No upcoming days", null);
    appendListItem(upcomingListEl, "No upcoming school days in current data range.");
    return;
  }

  for (const day of upcomingSchoolDays.slice(0, 3)) {
    const chipText = `${toShortDateLabel(day.date)} ${formatDayTypeLabel(day.entry)}`;
    appendChip(upcomingGlanceEl, chipText, day.entry);
  }

  for (const day of upcomingSchoolDays) {
    const prefix = day.date === todayIso ? "Today" : toPrettyDate(day.date, timezone);
    const scheduleLabel = formatDayTypeLabel(day.entry);
    const noteText = day.entry.note ? ` (${day.entry.note})` : "";
    appendListItem(upcomingListEl, `${prefix}: ${scheduleLabel}${noteText}`);
  }
}

render();
