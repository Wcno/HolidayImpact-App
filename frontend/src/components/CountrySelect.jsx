import { getCountries } from "../constants/countries";
import { useLang } from "../i18n/LanguageContext";

export default function CountrySelect({ value, onChange, label }) {
  const { lang, t } = useLang();
  return (
    <label className="field">
      <span>{label || t("field_country")}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {getCountries(lang).map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
