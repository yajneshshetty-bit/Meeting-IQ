import { useEffect, useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { FreshnessBadge } from './FreshnessBadge.jsx';

export function SearchModal({ open, onClose }) {
  const { userId } = useUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [freshness, setFreshness] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await bffFetch(`/api/search?q=${encodeURIComponent(query)}`, { userId });
        setResults(res.data?.results || []);
        setFreshness(res.freshness);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query, open, userId]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="search-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Global search">
        <input
          autoFocus
          type="search"
          placeholder="Search opportunities, meetings, accounts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FreshnessBadge freshness={freshness} />
        {loading && <p className="muted">Searching…</p>}
        <ul className="search-results">
          {results.map((r) => (
            <li key={`${r.entity_id}-${r.profile || ''}`}>
              <strong>{r.title}</strong>
              <span>{r.snippet}</span>
            </li>
          ))}
          {!loading && results.length === 0 && <li className="muted">No results</li>}
        </ul>
      </div>
    </div>
  );
}
