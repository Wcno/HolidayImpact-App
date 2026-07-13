import { COUNTRIES, countryName } from "../constants/countries";
import { useLang } from "../i18n/LanguageContext";

export default function CountrySelect({ value, onChange, label }) {
  const { lang, t } = useLang();
  return (
    <label className="field">
      <span>{label || t("field_country")}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {countryName(c, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}
