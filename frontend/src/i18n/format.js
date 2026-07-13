// Locale-aware month/weekday labels and date formatting, without depending on
// the browser locale (so output is stable regardless of the user's system).

const MONTHS_SHORT = {
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// The API returns weekday keys in English. Map them to each language.
const WEEKDAYS = {
  Monday: { es: "Lunes", en: "Monday" },
  Tuesday: { es: "Martes", en: "Tuesday" },
  Wednesday: { es: "Miércoles", en: "Wednesday" },
  Thursday: { es: "Jueves", en: "Thursday" },
  Friday: { es: "Viernes", en: "Friday" },
  Saturday: { es: "Sábado", en: "Saturday" },
  Sunday: { es: "Domingo", en: "Sunday" },
};

const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Month index (1-12 as string or number) → short label.
export function monthShort(month, lang) {
  return MONTHS_SHORT[lang][Number(month) - 1];
}

// English weekday name → full localized name.
export function weekdayFull(englishName, lang) {
  return WEEKDAYS[englishName] ? WEEKDAYS[englishName][lang] : englishName;
}

export function weekdayShort(englishName, lang) {
  return weekdayFull(englishName, lang).slice(0, 3);
}

// ISO date (YYYY-MM-DD) → "Lunes, 06 ene 2026" / "Monday, Jan 06 2026".
export function formatHolidayDate(iso, lang) {
  const [y, m, d] = iso.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay(); // 0=Sun..6=Sat
  const englishName = WEEKDAY_ORDER[(jsDay + 6) % 7]; // Mon-first
  const weekday = weekdayFull(englishName, lang);
  const day = String(d).padStart(2, "0");
  return lang === "es"
    ? `${weekday}, ${day} ${monthShort(m, lang)} ${y}`
    : `${weekday}, ${monthShort(m, lang)} ${day} ${y}`;
}
