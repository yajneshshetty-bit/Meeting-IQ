import { useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { FreshnessBadge } from './FreshnessBadge.jsx';

export function ResearchBanner() {
  const { userId } = useUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [freshness, setFreshness] = useState(null);

  async function search() {
    const res = await bffFetch(`/api/search/accounts?q=${encodeURIComponent(query)}`, { userId });
    setResults(res.data);
    setFreshness(res.freshness);
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
            <FreshnessBadge freshness={freshness} />
            <ul className="account-results">
              {(results?.accounts || []).map((a) => (
                <li key={a.account_id}>
                  <strong>{a.name}</strong>
                  <span>Tier: {a.tier} · Health: {a.health_score}</span>
                </li>
              ))}
            </ul>
            <p className="muted note">AI synthesis via Experience Package ships in Phase 7.</p>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
