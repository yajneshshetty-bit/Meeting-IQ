import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { FreshnessBadge } from '../components/FreshnessBadge.jsx';
import { AccountGroup, VocModal } from '../components/AccountGroup.jsx';
import { formatCurrency, ACCOUNT_NAMES } from '../api/client.js';
import { useBff } from '../hooks/useBff.js';
import { useUser } from '../context/UserContext.jsx';
import { Navigate } from 'react-router-dom';

export function ExecutiveViewPage() {
  const { canExecutive } = useUser();
  const [mode, setMode] = useState('opportunities');
  const [productFilter, setProductFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [vocAccount, setVocAccount] = useState(null);
  const [qbrDeal, setQbrDeal] = useState(null);

  const pipeline = useBff('/api/executive/pipeline', { skip: !canExecutive });
  const forecast = useBff('/api/executive/forecast', { skip: !canExecutive });
  const rising = useBff('/api/executive/rising-risk', { skip: !canExecutive });
  const products = useBff('/api/products', { skip: !canExecutive });

  const accounts = useMemo(() => {
    let list = pipeline.data?.accounts || [];
    if (productFilter !== 'all') {
      list = list.map((a) => ({
        ...a,
        opportunities: a.opportunities.filter((o) => o.product_id === productFilter),
      })).filter((a) => a.opportunities.length > 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.map((a) => ({
        ...a,
        opportunities: a.opportunities.filter(
          (o) => o.name.toLowerCase().includes(q) || o.opportunity_id.toLowerCase().includes(q),
        ),
      })).filter((a) => a.opportunities.length > 0 || (ACCOUNT_NAMES[a.account_id] || a.account_id).toLowerCase().includes(q));
    }
    return list;
  }, [pipeline.data, productFilter, search]);

  if (!canExecutive) return <Navigate to="/" replace />;

  return (
    <Layout notificationCount={0}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Executive &amp; Scale / Pipeline · Q3</p>
          <h1>Pipeline · Q3</h1>
        </div>
      </div>
      <FreshnessBadge freshness={pipeline.freshness || forecast.freshness} />

      <div className="exec-kpis">
        <div className="exec-kpi">
          <span>Committed pipeline</span>
          <strong>{formatCurrency(pipeline.data?.committed_pipeline || forecast.data?.committed_amount || 0)}</strong>
        </div>
        <div className="exec-kpi ai">
          <span>✨ AI-adjusted</span>
          <strong>{formatCurrency(forecast.data?.ai_adjusted_amount || pipeline.data?.ai_adjusted_pipeline || 0)}</strong>
        </div>
        <div className="exec-kpi risk">
          <span>✨ Rising-risk</span>
          <strong>{rising.data?.count ?? 0}</strong>
        </div>
      </div>

      <div className="exec-toolbar">
        <div className="segmented">
          <button type="button" className={mode === 'opportunities' ? 'active' : ''} onClick={() => setMode('opportunities')}>Opportunities</button>
          <button type="button" className={mode === 'leads' ? 'active' : ''} onClick={() => setMode('leads')}>Leads</button>
        </div>
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">All products</option>
          {(products.data?.products || []).map((p) => (
            <option key={p.product_id} value={p.product_id}>{p.name}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search opportunities by name, id, or account…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {mode === 'leads' && <p className="muted">Lead view uses pipeline search profile — switch to Opportunities for deal hierarchy.</p>}

      <div className="account-list">
        {accounts.map((a) => (
          <AccountGroup
            key={a.account_id}
            account={{
              ...a,
              displayName: ACCOUNT_NAMES[a.account_id] || a.account_id,
            }}
            onVoc={(id) => setVocAccount({ id, name: ACCOUNT_NAMES[id] || id })}
            onQbr={(deal) => setQbrDeal(deal)}
          />
        ))}
      </div>

      {vocAccount && (
        <VocModal
          accountId={vocAccount.id}
          accountName={vocAccount.name}
          onClose={() => setVocAccount(null)}
        />
      )}
      {qbrDeal && (
        <div className="modal-overlay" onClick={() => setQbrDeal(null)} role="presentation">
          <div className="voc-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <h2>QBR — {qbrDeal.name}</h2>
            <p>Stage: {qbrDeal.stage} · {formatCurrency(qbrDeal.amount)}</p>
            <p className="muted note">QBR narrative via Experience Package ships in Phase 7.</p>
            <button type="button" onClick={() => setQbrDeal(null)}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
