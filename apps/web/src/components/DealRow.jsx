import { formatCurrency, formatStage } from '../api/client.js';

export function StageBadge({ stage, riskLevel }) {
  const cls = ['closed_won', 'closed_lost'].includes(stage)
    ? stage.replace('_', '-')
    : riskLevel === 'at_risk' ? 'stalled' : stage?.replace('_', '-');
  return <span className={`stage-badge ${cls}`}>{formatStage(stage)}</span>;
}

export function ProgressBar({ commit, amount, atRisk }) {
  const pct = amount ? Math.min(100, Math.round((commit / amount) * 100)) : 0;
  return (
    <div className="progress-wrap">
      <div className={`progress-bar ${atRisk ? 'at-risk' : ''}`} style={{ width: `${pct}%` }} />
      <span>{formatCurrency(commit)} / {formatCurrency(amount)}</span>
    </div>
  );
}
