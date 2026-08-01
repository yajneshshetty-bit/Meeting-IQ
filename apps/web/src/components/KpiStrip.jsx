import { formatCurrency } from '../api/client.js';

const KPI_META = [
  { key: 'committed_pipeline', label: 'Pipeline', format: formatCurrency, tone: 'blue' },
  { key: 'at_risk_deals', label: 'At-risk deals', tone: 'red' },
  { key: 'meetings_this_week', label: 'Meetings this week', tone: 'purple' },
  { key: 'actions_due', label: 'Actions due', tone: 'orange', sub: (k) => (k.actions_overdue ? `${k.actions_overdue} overdue` : null) },
  { key: 'avg_meeting_quality', label: 'Avg quality', tone: 'green' },
];

export function KpiStrip({ kpis }) {
  if (!kpis) return null;
  return (
    <div className="kpi-strip">
      {KPI_META.map(({ key, label, format, tone, sub }) => (
        <div key={key} className={`kpi-card tone-${tone}`}>
          <span className="kpi-label">{label}</span>
          <span className="kpi-value">{format ? format(kpis[key]) : kpis[key]}</span>
          {sub?.(kpis) && <span className="kpi-sub">{sub(kpis)}</span>}
        </div>
      ))}
    </div>
  );
}
