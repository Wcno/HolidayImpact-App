import { useState } from "react";
import { compareCountries } from "../api/client";
import { getCountries } from "../constants/countries";
import { useLang } from "../i18n/LanguageContext";
import { formatHolidayDate } from "../i18n/format";
import { translateHoliday } from "../i18n/holidayNames";
import YearSelect from "../components/YearSelect";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const DEFAULT_SELECTION = ["PA", "CO", "MX"];

export default function ComparePage() {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggleCountry(code) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function handleCompare() {
    setLoading(true);
    setError(null);
    try {
      const result = await compareCountries(selected, year);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>{t("compare_title")}</h1>
      <p className="muted">{t("compare_hint")}</p>
      <div className="country-checklist">
        {getCountries(lang).map((c) => (
          <label key={c.code} className="checkbox-field">
            <input
              type="checkbox"
              checked={selected.includes(c.code)}
              onChange={() => toggleCountry(c.code)}
            />
            {c.name}
          </label>
        ))}
      </div>
      <div className="controls">
        <YearSelect value={year} onChange={setYear} />
        <button onClick={handleCompare} disabled={selected.length < 2 || selected.length > 5}>
          {t("compare_button")}
        </button>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        data && (
          <>
            <h2>{t("compare_summary")}</h2>
            <ul>
              {Object.entries(data.summary).map(([code, count]) => (
                <li key={code}>{t("compare_country_count", { code, n: count })}</li>
              ))}
            </ul>
            <h2>{t("compare_common", { n: data.commonHolidays.length })}</h2>
            <table className="holiday-table">
              <thead>
                <tr>
                  <th>{t("table_date")}</th>
                  <th>{t("compare_th_names")}</th>
                </tr>
              </thead>
              <tbody>
                {data.commonHolidays.map((h) => (
                  <tr key={h.date}>
                    <td>{formatHolidayDate(h.date, lang)}</td>
                    <td>
                      {Object.entries(h.namesByCountry)
                        .map(([code, name]) => `${code}: ${translateHoliday(name, lang)}`)
                        .join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
    </section>
  );
}
