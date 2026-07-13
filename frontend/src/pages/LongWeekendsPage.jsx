import { useState } from "react";
import { getLongWeekends } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import LongWeekendCard from "../components/LongWeekendCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function LongWeekendsPage() {
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error } = useApiData(() => getLongWeekends(country, year), [country, year]);

  return (
    <section>
      <h1>Fines de semana largos</h1>
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
            <p>{data.longWeekendCount} fines de semana largos detectados</p>
            <div className="card-grid">
              {data.longWeekends.map((lw) => (
                <LongWeekendCard key={lw.startDate} longWeekend={lw} />
              ))}
            </div>
          </>
        )
      )}
    </section>
  );
}
