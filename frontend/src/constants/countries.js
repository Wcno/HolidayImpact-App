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
