import { useEffect, useState } from 'react';
import { ProgressBar, StageBadge } from './DealRow.jsx';
import { AiResultPanel, useAiExperience } from './AiResultPanel.jsx';

export function VocModal({ accountId, accountName, onClose }) {
  const voc = useAiExperience('voice-of-customer');

  useEffect(() => {
    if (accountId) voc.run({ account_id: accountId });
  }, [accountId]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="voc-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>Voice of customer — {accountName}</h2>
        <AiResultPanel result={voc.result} loading={voc.loading} error={voc.error} />
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function QbrModal({ deal, accountId, onClose }) {
  const qbr = useAiExperience('qbr-narrative');

  useEffect(() => {
    if (accountId) qbr.run({ account_id: accountId, opportunity_id: deal?.opportunity_id });
  }, [accountId, deal?.opportunity_id]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="voc-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>QBR — {deal?.name}</h2>
        <AiResultPanel result={qbr.result} loading={qbr.loading} error={qbr.error} />
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
            <button type="button" onClick={() => onQbr({ ...opp, account_id: account.account_id })}>QBR</button>
          </div>
        </div>
      ))}
    </div>
  );
}
