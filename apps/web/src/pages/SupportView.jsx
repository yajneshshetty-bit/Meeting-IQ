import { Layout } from '../components/Layout.jsx';
import { FreshnessBadge } from '../components/FreshnessBadge.jsx';
import { useBff } from '../hooks/useBff.js';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export function SupportViewPage() {
  const { isSupport } = useUser();
  const diagnostics = useBff('/api/support/diagnostics', { skip: !isSupport });

  if (!isSupport) return <Navigate to="/" replace />;

  return (
    <Layout notificationCount={0}>
      <div className="page-header">
        <p className="eyebrow">Support</p>
        <h1>Diagnostics</h1>
      </div>
      <FreshnessBadge freshness={diagnostics.freshness} />
      <section className="panel">
        <h2>Tickets ({diagnostics.data?.count || 0})</h2>
        <ul className="ticket-list">
          {(diagnostics.data?.tickets || []).map((t) => (
            <li key={t.ticket_id}>
              <strong>{t.subject}</strong>
              <span>{t.priority} · {t.status}</span>
              {t.escalated && <span className="risk-pill">Escalated</span>}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
