const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, params) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body;
}

export function getHolidays(country, year) {
  return request("/holidays", { country, year });
}

export function getLongWeekends(country, year) {
  return request("/long-weekends", { country, year });
}

export function compareCountries(countries, year) {
  return request("/compare", { countries: countries.join(","), year });
}

export function getDashboard(country, year) {
  return request("/dashboard", { country, year });
}
