import { useEffect, useState } from "react";
import { getDashboard } from "../api/client";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default function DashboardPage() {
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboard(country, year)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [country, year]);

  return (
    <section>
      <h1>Dashboard de feriados</h1>
      <div className="controls">
        <CountrySelect value={country} onChange={setCountry} />
        <YearSelect value={year} onChange={setYear} />
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        data && (
          <div className="dashboard-grid">
            <div className="stat-tile">
              <span className="stat-value">{data.totalHolidays}</span>
              <span className="stat-label">Total de feriados</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{data.longWeekendCount}</span>
              <span className="stat-label">Fines de semana largos</span>
            </div>
            <div className="stat-tile">
              {data.nextHoliday ? (
                <>
                  <span className="stat-value">{data.nextHoliday.daysRemaining}</span>
                  <span className="stat-label">
                    días para {data.nextHoliday.name} ({data.nextHoliday.date})
                  </span>
                </>
              ) : (
                <span className="stat-label">Sin próximos feriados este año</span>
              )}
            </div>

            <div className="chart-block">
              <h3>Distribución por mes</h3>
              <div className="bar-chart">
                {Object.entries(data.byMonth).map(([month, count]) => (
                  <div className="bar" key={month} title={`${MONTH_LABELS[Number(month) - 1]}: ${count} feriados`}>
                    <div className="bar-fill" style={{ height: `${count * 20 + 4}px` }} />
                    <span className="bar-label">{MONTH_LABELS[Number(month) - 1]}</span>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-block">
              <h3>Distribución por día de semana</h3>
              <div className="bar-chart">
                {Object.entries(data.byWeekday).map(([weekday, count]) => (
                  <div className="bar" key={weekday} title={`${weekday}: ${count} feriados`}>
                    <div className="bar-fill" style={{ height: `${count * 20 + 4}px` }} />
                    <span className="bar-label">{weekday.slice(0, 3)}</span>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </section>
  );
}
