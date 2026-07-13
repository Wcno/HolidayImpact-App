import { useState } from "react";
import { getDashboard } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import BarChart from "../components/BarChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default function DashboardPage() {
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error } = useApiData(() => getDashboard(country, year), [country, year]);

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
              <BarChart
                data={data.byMonth}
                formatLabel={(month) => MONTH_LABELS[Number(month) - 1]}
                formatTooltip={(month, count) => `${MONTH_LABELS[Number(month) - 1]}: ${count} feriados`}
              />
            </div>

            <div className="chart-block">
              <h3>Distribución por día de semana</h3>
              <BarChart
                data={data.byWeekday}
                formatLabel={(weekday) => weekday.slice(0, 3)}
                formatTooltip={(weekday, count) => `${weekday}: ${count} feriados`}
              />
            </div>
          </div>
        )
      )}
    </section>
  );
}
