import { useState } from "react";
import { getHolidays } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useLang } from "../i18n/LanguageContext";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import HolidayTable from "../components/HolidayTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function HolidaysPage() {
  const { t } = useLang();
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error } = useApiData(() => getHolidays(country, year), [country, year]);

  return (
    <section>
      <h1>{t("holidays_title")}</h1>
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
            <p className="result-count">{t("holidays_count", { n: data.count })}</p>
            <HolidayTable holidays={data.holidays} />
          </>
        )
      )}
    </section>
  );
}
