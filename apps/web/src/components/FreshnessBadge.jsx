export function FreshnessBadge({ freshness }) {
  if (!freshness) return null;
  const synced = freshness.last_synced
    ? new Date(freshness.last_synced).toLocaleString()
    : 'unknown';
  return (
    <span className="freshness-badge" title={`Source: ${freshness.source} · Confidence: ${freshness.confidence}`}>
      Synced {synced}
      {freshness.pending_updates > 0 && ` · ${freshness.pending_updates} pending`}
    </span>
  );
}
