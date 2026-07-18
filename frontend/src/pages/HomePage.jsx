import { Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import { COUNTRY_CODES } from "../constants/countries";

const FEATURES = [
  { to: "/feriados", icon: "📅", title: "feat_holidays_title", desc: "feat_holidays_desc" },
  { to: "/fines-largos", icon: "🏖️", title: "feat_longweekends_title", desc: "feat_longweekends_desc" },
  { to: "/comparar", icon: "🌎", title: "feat_compare_title", desc: "feat_compare_desc" },
];

export default function HomePage() {
  const { t } = useLang();
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          {t("home_title_a")}
          <span className="hero-accent">{t("home_title_accent")}</span>
        </h1>
        <p className="hero-subtitle">{t("home_subtitle")}</p>
        <div className="hero-actions">
          <Link className="btn-primary" to="/feriados">{t("home_cta_primary")}</Link>
          <Link className="btn-secondary" to="/dashboard">{t("home_cta_secondary")}</Link>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="feature-card">
            <span className="feature-icon" aria-hidden="true">{f.icon}</span>
            <h3 className="feature-title">{t(f.title)}</h3>
            <p className="feature-desc">{t(f.desc, { n: COUNTRY_CODES.length })}</p>
            <span className="feature-link">{t("home_open")} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
