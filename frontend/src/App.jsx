import { NavLink, Route, Routes } from "react-router-dom";
import { useLang } from "./i18n/LanguageContext";
import HomePage from "./pages/HomePage";
import HolidaysPage from "./pages/HolidaysPage";
import LongWeekendsPage from "./pages/LongWeekendsPage";
import ComparePage from "./pages/ComparePage";
import DashboardPage from "./pages/DashboardPage";

function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label={t("lang_label")}>
      <button
        className={lang === "es" ? "active" : ""}
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}

export default function App() {
  const { t } = useLang();
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-title">🌎 HolidayImpact</NavLink>
        <nav className="app-nav">
          <NavLink to="/" end>{t("nav_home")}</NavLink>
          <NavLink to="/feriados">{t("nav_holidays")}</NavLink>
          <NavLink to="/fines-largos">{t("nav_longweekends")}</NavLink>
          <NavLink to="/comparar">{t("nav_compare")}</NavLink>
          <NavLink to="/dashboard">{t("nav_dashboard")}</NavLink>
        </nav>
        <LanguageToggle />
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feriados" element={<HolidaysPage />} />
          <Route path="/fines-largos" element={<LongWeekendsPage />} />
          <Route path="/comparar" element={<ComparePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
