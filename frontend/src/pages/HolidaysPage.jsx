import { useEffect, useState } from "react";
import { getHolidays } from "../api/client";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import HolidayTable from "../components/HolidayTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function HolidaysPage() {
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getHolidays(country, year)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [country, year]);

  return (
    <section>
      <h1>Feriados por país y año</h1>
      <div className="controls">
        <CountrySelect value={country} onChange={setCountry} />
        <YearSelect value={year} onChange={setYear} />
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        data && (
          <>
            <p>{data.count} feriados encontrados ({data.source === "cache" ? "desde caché" : "desde Nager.Date"})</p>
            <HolidayTable holidays={data.holidays} />
          </>
        )
      )}
    </section>
  );
}
