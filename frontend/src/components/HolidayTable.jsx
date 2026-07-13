const WEEKDAY_LABELS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

// Formats an ISO date (YYYY-MM-DD) as "Lunes, 06 ene 2026" in Spanish, without
// relying on the browser locale.
const MONTH_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[(new Date(y, m - 1, d).getDay() + 6) % 7];
  return `${weekday}, ${String(d).padStart(2, "0")} ${MONTH_SHORT[m - 1]} ${y}`;
}

export default function HolidayTable({ holidays }) {
  if (!holidays || holidays.length === 0) {
    return <p className="muted">No hay feriados para mostrar.</p>;
  }

  return (
    <table className="holiday-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Feriado</th>
        </tr>
      </thead>
      <tbody>
        {holidays.map((h) => (
          <tr key={h.date + h.localName}>
            <td>{formatDate(h.date)}</td>
            <td>{h.localName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
