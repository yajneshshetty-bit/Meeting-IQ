import { useEffect, useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { ProgressBar, StageBadge } from './DealRow.jsx';

export function VocModal({ accountId, accountName, onClose }) {
  const { userId } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bffFetch(`/api/search/voc?account_id=${encodeURIComponent(accountId)}`, { userId })
      .then((res) => setItems(res.data?.communications || []))
      .finally(() => setLoading(false));
  }, [accountId, userId]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="voc-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>Voice of customer — {accountName}</h2>
        {loading && <p>Loading…</p>}
        <ul>
          {items.map((c) => (
            <li key={c.entity_id}>
              <strong>{c.title}</strong>
              <p>{c.snippet}</p>
            </li>
          ))}
          {!loading && items.length === 0 && <p className="muted">No communications found</p>}
        </ul>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function AccountGroup({ account, onVoc, onQbr }) {
  const [expanded, setExpanded] = useState(true);
  const label = account.displayName || account.account_id;

  return (
    <div className="account-group">
      <button type="button" className="account-header" onClick={() => setExpanded(!expanded)}>
        <span>{label}</span>
        <span>{account.opportunities.length} deal{account.opportunities.length !== 1 ? 's' : ''}</span>
      </button>
      {expanded && account.opportunities.map((opp) => (
        <div key={opp.opportunity_id} className="deal-row">
          <div className="deal-main">
            <strong>{opp.name}</strong>
            <span className="deal-id">{opp.opportunity_id}</span>
            <StageBadge stage={opp.stage} riskLevel={opp.risk_level} />
            {['at_risk', 'rising'].includes(opp.risk_level) && <span className="risk-pill">↑ risk</span>}
          </div>
          <ProgressBar commit={opp.commit_amount || opp.amount * 0.75} amount={opp.amount} atRisk={opp.risk_level === 'at_risk'} />
          <div className="deal-actions">
            <button type="button" onClick={() => onVoc(account.account_id)}>Voice of customer →</button>
            <button type="button" onClick={() => onQbr(opp)}>QBR</button>
          </div>
        </div>
      ))}
    </div>
  );
}
