import { useLang } from "../i18n/LanguageContext";
import { translateHoliday } from "../i18n/holidayNames";

export default function LongWeekendCard({ longWeekend }) {
  const { lang, t } = useLang();
  const { startDate, endDate, totalDays, type, bridgeDate, holidayNames } = longWeekend;
  const names = holidayNames.map((n) => translateHoliday(n, lang)).join(", ");

  return (
    <div className="card">
      <div className="card-header">
        <strong>{startDate} → {endDate}</strong>
        <span className={`badge ${type}`}>
          {type === "bridge" ? t("badge_bridge") : t("badge_natural")}
        </span>
      </div>
      <p>{t("lw_days", { n: totalDays })}</p>
      {bridgeDate && <p className="muted">{t("lw_bridge_suggested", { date: bridgeDate })}</p>}
      <p className="muted">{t("lw_holidays", { names })}</p>
    </div>
  );
}
