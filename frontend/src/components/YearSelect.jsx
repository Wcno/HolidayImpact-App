import { useLang } from "../i18n/LanguageContext";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 1 + i);

export default function YearSelect({ value, onChange, label }) {
  const { t } = useLang();
  return (
    <label className="field">
      <span>{label || t("field_year")}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
