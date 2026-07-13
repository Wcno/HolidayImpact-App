export default function HolidayTable({ holidays }) {
  if (!holidays || holidays.length === 0) {
    return <p className="muted">No hay feriados para mostrar.</p>;
  }

  return (
    <table className="holiday-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Nombre local</th>
          <th>Nombre (inglés)</th>
        </tr>
      </thead>
      <tbody>
        {holidays.map((h) => (
          <tr key={h.date + h.localName}>
            <td>{h.date}</td>
            <td>{h.localName}</td>
            <td>{h.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
