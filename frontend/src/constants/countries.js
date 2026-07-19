// Every country supported by the Nager.Date API (https://date.nager.at/api/v3/AvailableCountries).
// The code list is a dev-time snapshot — static on purpose: no dedicated Lambda exposes
// the list, so it's sourced once rather than fetched live on every page load.
// Names are localized at runtime with Intl.DisplayNames, so no manual translation table.
export const COUNTRY_CODES = [
  "AD", "AG", "AI", "AL", "AM", "AO", "AR", "AT", "AU", "AW", "AX", "BA",
  "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BO", "BQ",
  "BR", "BS", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL",
  "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK",
  "DM", "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "FI", "FK", "FO", "FR",
  "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP",
  "GQ", "GR", "GT", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE",
  "IM", "IQ", "IS", "IT", "JE", "JM", "JP", "KE", "KH", "KI", "KM", "KN",
  "KR", "KY", "KZ", "LC", "LI", "LR", "LS", "LT", "LU", "LV", "LY", "MA",
  "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MN", "MQ", "MR", "MS", "MT",
  "MW", "MX", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NR", "NU",
  "NZ", "PA", "PE", "PG", "PH", "PL", "PM", "PN", "PR", "PT", "PW", "PY",
  "RO", "RS", "RU", "RW", "SC", "SE", "SG", "SI", "SJ", "SK", "SL", "SM",
  "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TC", "TD", "TG", "TN",
  "TO", "TR", "TT", "TV", "TZ", "UA", "UG", "US", "UY", "VA", "VC", "VE",
  "VG", "VI", "VN", "WS", "ZA", "ZM", "ZW",
];

const cache = {};

// Returns [{ code, name }] with names in the given language, sorted alphabetically
// for that language. Memoized per language.
export function getCountries(lang) {
  if (!cache[lang]) {
    const names = new Intl.DisplayNames([lang], { type: "region" });
    const collator = new Intl.Collator(lang);
    cache[lang] = COUNTRY_CODES.map((code) => ({ code, name: names.of(code) || code }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }
  return cache[lang];
}

// Accent- and case-insensitive form used for matching ("Panamá" -> "panama").
function normalize(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Edit distance with early exit; strings here are short so the DP is cheap.
function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length];
}

// Fuzzy search over the localized country list. Ranks exact prefixes first,
// then word prefixes and substrings, and finally typo-tolerant matches
// (Levenshtein distance <= 1 for short queries, <= 2 for longer ones), so
// "colonbia" still finds "Colombia".
export function searchCountries(lang, query) {
  const list = getCountries(lang);
  const q = normalize(query.trim());
  if (!q) return list;

  const maxDistance = q.length >= 6 ? 2 : q.length >= 4 ? 1 : 0;
  const scored = [];
  for (const c of list) {
    const name = normalize(c.name);
    const words = name.split(/[\s-]+/);
    let score = 0;
    if (name.startsWith(q)) score = 100;
    else if (c.code.toLowerCase() === q) score = 90;
    else if (words.some((w) => w.startsWith(q))) score = 80;
    else if (name.includes(q)) score = 60;
    else if (maxDistance > 0) {
      const d = Math.min(
        ...words.flatMap((w) => [levenshtein(q, w), levenshtein(q, w.slice(0, q.length))])
      );
      if (d <= maxDistance) score = 40 - d * 10;
    }
    if (score > 0) scored.push({ ...c, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
