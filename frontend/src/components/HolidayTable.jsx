import { useLang } from "../i18n/LanguageContext";
import { formatHolidayDate } from "../i18n/format";
import { translateHoliday } from "../i18n/holidayNames";

export default function HolidayTable({ holidays }) {
  const { lang, t } = useLang();

  if (!holidays || holidays.length === 0) {
    return <p className="muted">{t("table_empty")}</p>;
  }

  return (
    <table className="holiday-table">
      <thead>
        <tr>
          <th>{t("table_date")}</th>
          <th>{t("table_holiday")}</th>
        </tr>
      </thead>
      <tbody>
        {holidays.map((h) => (
          <tr key={h.date + h.name}>
            <td>{formatHolidayDate(h.date, lang)}</td>
            <td>{translateHoliday(h.name, lang)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
