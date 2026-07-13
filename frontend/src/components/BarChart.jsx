const MAX_BAR_PX = 100; // tallest bar; leaves room for labels inside the 160px .bar-chart

// Renders a simple bar chart from a { key: count } map. Bar heights scale to the
// series max so the chart adapts to any data range instead of assuming small counts.
export default function BarChart({ data, formatLabel = (k) => k, formatTooltip }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="bar-chart">
      {entries.map(([key, count]) => {
        const label = formatLabel(key);
        return (
          <div className="bar" key={key} title={formatTooltip ? formatTooltip(key, count) : `${label}: ${count}`}>
            <div className="bar-fill" style={{ height: `${(count / max) * MAX_BAR_PX}px` }} />
            <span className="bar-label">{label}</span>
            <span className="bar-value">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
