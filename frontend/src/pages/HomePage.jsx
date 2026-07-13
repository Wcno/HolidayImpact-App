import { Link } from "react-router-dom";

const FEATURES = [
  {
    to: "/feriados",
    icon: "📅",
    title: "Feriados por país",
    description: "Consulta los días festivos oficiales de más de 100 países para cualquier año.",
  },
  {
    to: "/fines-largos",
    icon: "🏖️",
    title: "Fines de semana largos",
    description: "Detecta automáticamente los puentes y planifica tus escapadas del año.",
  },
  {
    to: "/comparar",
    icon: "🌎",
    title: "Comparar países",
    description: "Compara los feriados de hasta 5 países y descubre cuáles tienen en común.",
  },
  {
    to: "/dashboard",
    icon: "📊",
    title: "Dashboard",
    description: "Métricas por país: distribución mensual y semanal, próximo feriado y más.",
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <span className="hero-badge">Datos abiertos de feriados</span>
        <h1 className="hero-title">
          Planifica tu año alrededor de los <span className="hero-accent">feriados</span>
        </h1>
        <p className="hero-subtitle">
          HolidayImpact reúne los días festivos de todo el mundo y los enriquece con
          métricas útiles: puentes, comparaciones entre países y estadísticas por año.
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" to="/feriados">Explorar feriados</Link>
          <Link className="btn-secondary" to="/dashboard">Ver dashboard</Link>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="feature-card">
            <span className="feature-icon" aria-hidden="true">{f.icon}</span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
            <span className="feature-link">Abrir →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
