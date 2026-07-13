// Curated subset of Nager.Date's AvailableCountries (https://date.nager.at/api/v3/AvailableCountries).
// Static on purpose: no dedicated Lambda exposes this list, so it's sourced once at dev time
// rather than fetched live on every page load. Names are provided per language.
export const COUNTRIES = [
  { code: "PA", es: "Panamá", en: "Panama" },
  { code: "CO", es: "Colombia", en: "Colombia" },
  { code: "MX", es: "México", en: "Mexico" },
  { code: "US", es: "Estados Unidos", en: "United States" },
  { code: "CA", es: "Canadá", en: "Canada" },
  { code: "BR", es: "Brasil", en: "Brazil" },
  { code: "AR", es: "Argentina", en: "Argentina" },
  { code: "CL", es: "Chile", en: "Chile" },
  { code: "PE", es: "Perú", en: "Peru" },
  { code: "EC", es: "Ecuador", en: "Ecuador" },
  { code: "ES", es: "España", en: "Spain" },
  { code: "FR", es: "Francia", en: "France" },
  { code: "DE", es: "Alemania", en: "Germany" },
  { code: "IT", es: "Italia", en: "Italy" },
  { code: "GB", es: "Reino Unido", en: "United Kingdom" },
  { code: "PT", es: "Portugal", en: "Portugal" },
  { code: "CR", es: "Costa Rica", en: "Costa Rica" },
  { code: "DO", es: "República Dominicana", en: "Dominican Republic" },
  { code: "GT", es: "Guatemala", en: "Guatemala" },
  { code: "UY", es: "Uruguay", en: "Uruguay" },
];

export function countryName(country, lang) {
  return country[lang] || country.es;
}
