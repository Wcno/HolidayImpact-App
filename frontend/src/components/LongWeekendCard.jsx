export default function LongWeekendCard({ longWeekend }) {
  const { startDate, endDate, totalDays, type, bridgeDate, holidayNames } = longWeekend;

  return (
    <div className="card">
      <div className="card-header">
        <strong>{startDate} → {endDate}</strong>
        <span className={`badge ${type}`}>{type === "bridge" ? "Puente" : "Natural"}</span>
      </div>
      <p>{totalDays} días libres consecutivos</p>
      {bridgeDate && <p className="muted">Día puente sugerido: {bridgeDate}</p>}
      <p className="muted">Feriado(s): {holidayNames.join(", ")}</p>
    </div>
  );
}
