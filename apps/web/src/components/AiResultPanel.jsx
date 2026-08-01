import { useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { FreshnessBadge } from './FreshnessBadge.jsx';

export function AiResultPanel({ title, result, loading, error, onClose }) {
  if (!title && !result && !loading && !error) return null;

  return (
    <div className="ai-result-panel">
      <div className="ai-result-header">
        <h3>{title}</h3>
        {onClose && <button type="button" className="btn-ghost" onClick={onClose}>Close</button>}
      </div>
      {loading && <p className="muted">Running AI experience via Zambyl…</p>}
      {error && <p className="error">{error}</p>}
      {result && (
        <>
          <FreshnessBadge freshness={result.freshness} />
          <pre className="ai-output">{JSON.stringify(result.data?.output?.summary || result.data?.output, null, 2)}</pre>
          {result.data?.citations?.length > 0 && (
            <div className="citations">
              <h4>Citations</h4>
              <ul>
                {result.data.citations.map((c, i) => (
                  <li key={i}>{c.source || c.entity_id || JSON.stringify(c)}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function useAiExperience(key) {
  const { userId } = useUser();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(body) {
    setLoading(true);
    setError(null);
    try {
      const res = await bffFetch(`/api/ai/${key}`, { userId, method: 'POST', body });
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, run, reset: () => { setResult(null); setError(null); } };
}
