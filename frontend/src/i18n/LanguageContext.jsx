import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings";

const LanguageContext = createContext(null);
const STORAGE_KEY = "holidayimpact.lang";

function initialLang() {
  const saved = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
  return saved === "en" || saved === "es" ? saved : "es";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // t(key, params) → localized string with {placeholders} filled from params.
  const t = useCallback(
    (key, params) => {
      let str = (STRINGS[lang] && STRINGS[lang][key]) || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, v);
        }
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
