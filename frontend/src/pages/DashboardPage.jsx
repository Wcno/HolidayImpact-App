import { useState } from "react";
import { getDashboard } from "../api/client";
import { useApiData } from "../hooks/useApiData";
import { useLang } from "../i18n/LanguageContext";
import { monthShort, weekdayShort, weekdayFull, formatHolidayDate } from "../i18n/format";
import { translateHoliday } from "../i18n/holidayNames";
import CountrySelect from "../components/CountrySelect";
import YearSelect from "../components/YearSelect";
import BarChart from "../components/BarChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function DashboardPage() {
  const { lang, t } = useLang();
  const [country, setCountry] = useState("PA");
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error } = useApiData(() => getDashboard(country, year), [country, year]);

  return (
    <section>
      <h1>{t("dash_title")}</h1>
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
            <div className="stat-tile-group">
              <div className="stat-tile stat-tile-half">
                <span className="stat-value">{data.totalHolidays}</span>
                <span className="stat-label">{t("dash_total")}</span>
              </div>
              <div className="stat-tile stat-tile-half">
                <span className="stat-value">{data.longWeekendCount}</span>
                <span className="stat-label">{t("dash_longweekends")}</span>
              </div>
            </div>
            <div className="stat-tile progress-tile">
              <span className="stat-value progress-stat-value">{data.holidaysPassed}/{data.totalHolidays}</span>
              <span className="stat-label">{t("dash_progress")}</span>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(data.holidaysPassed / data.totalHolidays) * 100}%` }}
                />
              </div>
              <span className="stat-label progress-sub">
                {t("dash_passed", { n: data.holidaysPassed })} · {t("dash_remaining", { n: data.holidaysRemaining })}
              </span>
            </div>
            <div className="stat-tile next-holiday">
              {data.nextHoliday ? (
                <>
                  <span className="stat-value">{data.nextHoliday.daysRemaining}</span>
                  <span className="stat-label">{t("dash_next_days")}</span>
                  <span className="next-holiday-name">
                    {translateHoliday(data.nextHoliday.name, lang)}
                  </span>
                  <span className="next-holiday-date">
                    {formatHolidayDate(data.nextHoliday.date, lang)}
                  </span>
                  {data.nextHoliday.observedDate && (
                    <span className="next-holiday-date">
                      {t("dash_observed", {
                        date: formatHolidayDate(data.nextHoliday.observedDate, lang),
                      })}
                    </span>
                  )}
                </>
              ) : (
                <span className="stat-label">{t("dash_no_next")}</span>
              )}
            </div>

            <div className="chart-block">
              <h3>{t("dash_by_month")}</h3>
              <BarChart
                data={data.byMonth}
                formatLabel={(month) => monthShort(month, lang)}
                formatTooltip={(month, count) =>
                  t("dash_tooltip", { label: monthShort(month, lang), n: count })
                }
              />
            </div>

            <div className="chart-block">
              <h3>{t("dash_by_weekday")}</h3>
              <BarChart
                data={data.byWeekday}
                formatLabel={(weekday) => weekdayShort(weekday, lang)}
                formatTooltip={(weekday, count) =>
                  t("dash_tooltip", { label: weekdayFull(weekday, lang), n: count })
                }
              />
            </div>
          </div>
        )
      )}
    </section>
  );
}
