import { useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { AiResultPanel, useAiExperience } from './AiResultPanel.jsx';

export function ResearchBanner() {
  const { userId } = useUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState([]);
  const ai = useAiExperience('company-research');

  async function search() {
    const res = await bffFetch(`/api/search/accounts?q=${encodeURIComponent(query)}`, { userId });
    setAccounts(res.data?.accounts || []);
  }

  async function research(accountId) {
    await ai.run({ account_id: accountId });
  }

  return (
    <>
      <button type="button" className="research-banner" onClick={() => setOpen(true)}>
        ✨ Research a company — new lead / prospect intel, live &amp; portfolio-aware →
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)} role="presentation">
          <div className="research-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <h2>Research a company</h2>
            <div className="research-search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Company name…"
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
              <button type="button" onClick={search}>Search</button>
            </div>
            <ul className="account-results">
              {accounts.map((a) => (
                <li key={a.account_id}>
                  <strong>{a.name}</strong>
                  <span>Tier: {a.tier} · Health: {a.health_score}</span>
                  <button type="button" onClick={() => research(a.account_id)}>Run AI research</button>
                </li>
              ))}
            </ul>
            <AiResultPanel
              title="AI Research"
              result={ai.result}
              loading={ai.loading}
              error={ai.error}
            />
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
