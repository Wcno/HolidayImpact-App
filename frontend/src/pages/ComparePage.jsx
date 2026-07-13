import { useState } from "react";
import { compareCountries } from "../api/client";
import { COUNTRIES } from "../constants/countries";
import YearSelect from "../components/YearSelect";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const DEFAULT_SELECTION = ["PA", "CO", "MX"];

export default function ComparePage() {
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
      <h1>Comparar feriados entre países</h1>
      <p className="muted">Selecciona entre 2 y 5 países.</p>
      <div className="country-checklist">
        {COUNTRIES.map((c) => (
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
          Comparar
        </button>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        data && (
          <>
            <h2>Resumen</h2>
            <ul>
              {Object.entries(data.summary).map(([code, count]) => (
                <li key={code}>{code}: {count} feriados</li>
              ))}
            </ul>
            <h2>Feriados en común ({data.commonHolidays.length})</h2>
            <table className="holiday-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombres por país</th>
                </tr>
              </thead>
              <tbody>
                {data.commonHolidays.map((h) => (
                  <tr key={h.date}>
                    <td>{h.date}</td>
                    <td>
                      {Object.entries(h.namesByCountry)
                        .map(([code, name]) => `${code}: ${name}`)
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
