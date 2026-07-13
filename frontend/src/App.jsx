import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HolidaysPage from "./pages/HolidaysPage";
import LongWeekendsPage from "./pages/LongWeekendsPage";
import ComparePage from "./pages/ComparePage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-title">🌎 HolidayImpact</NavLink>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/feriados">Feriados</NavLink>
          <NavLink to="/fines-largos">Fines largos</NavLink>
          <NavLink to="/comparar">Comparar</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
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
