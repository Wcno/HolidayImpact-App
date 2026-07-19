import { useRef, useState } from "react";
import { getCountries, searchCountries } from "../constants/countries";
import { useLang } from "../i18n/LanguageContext";

// Searchable combobox: type to fuzzy-filter the country list (accent- and
// typo-tolerant via searchCountries), navigate with arrows, Enter to pick.
export default function CountrySelect({ value, onChange, label }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState(null); // null = closed, show selection
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef(null);

  const open = query !== null;
  const selected = getCountries(lang).find((c) => c.code === value);
  const results = open ? searchCountries(lang, query) : [];

  function select(code) {
    onChange(code);
    setQuery(null);
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = Math.min(Math.max(highlight + delta, 0), results.length - 1);
      setHighlight(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) select(results[highlight].code);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <label className="field combobox">
      <span>{label || t("field_country")}</span>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        placeholder={t("country_search_placeholder")}
        value={open ? query : selected ? selected.name : ""}
        onFocus={(e) => {
          setQuery("");
          setHighlight(0);
          e.target.select();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setQuery(null)}
      />
      {open && (
        <ul className="combobox-list" role="listbox" ref={listRef}>
          {results.length === 0 && (
            <li className="combobox-empty">{t("country_search_empty")}</li>
          )}
          {results.map((c, i) => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              className={i === highlight ? "highlighted" : ""}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focus; select before blur
                select(c.code);
              }}
              onMouseEnter={() => setHighlight(i)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
