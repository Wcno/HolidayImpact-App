// Curated subset of Nager.Date's AvailableCountries (https://date.nager.at/api/v3/AvailableCountries).
// Static on purpose: no dedicated Lambda exposes this list, so it's sourced once at dev time
// rather than fetched live on every page load.
export const COUNTRIES = [
  { code: "PA", name: "Panamá" },
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "México" },
  { code: "US", name: "Estados Unidos" },
  { code: "CA", name: "Canadá" },
  { code: "BR", name: "Brasil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "EC", name: "Ecuador" },
  { code: "ES", name: "España" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Alemania" },
  { code: "IT", name: "Italia" },
  { code: "GB", name: "Reino Unido" },
  { code: "PT", name: "Portugal" },
  { code: "CR", name: "Costa Rica" },
  { code: "DO", name: "República Dominicana" },
  { code: "GT", name: "Guatemala" },
  { code: "UY", name: "Uruguay" },
];
