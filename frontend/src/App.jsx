import { NavLink, Route, Routes } from "react-router-dom";
import HolidaysPage from "./pages/HolidaysPage";
import LongWeekendsPage from "./pages/LongWeekendsPage";
import ComparePage from "./pages/ComparePage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🌎 HolidayImpact</h1>
        <nav>
          <NavLink to="/" end>Feriados</NavLink>
          <NavLink to="/long-weekends">Fines largos</NavLink>
          <NavLink to="/compare">Comparar</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HolidaysPage />} />
          <Route path="/long-weekends" element={<LongWeekendsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
