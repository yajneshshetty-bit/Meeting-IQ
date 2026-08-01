import { useRef, useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { KpiStrip } from '../components/KpiStrip.jsx';
import { AgendaWidget } from '../components/AgendaWidget.jsx';
import { NotificationPanel } from '../components/NotificationPanel.jsx';
import { ResearchBanner } from '../components/ResearchBanner.jsx';
import { WidgetSettingsModal } from '../components/WidgetSettingsModal.jsx';
import { FreshnessBadge } from '../components/FreshnessBadge.jsx';
import { useBff } from '../hooks/useBff.js';
import { useRealtimeInvalidation } from '../hooks/useRealtime.js';

export function CommandCenterPage() {
  const notifRef = useRef(null);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const overview = useBff('/api/command-center/overview');
  const agenda = useBff('/api/command-center/agenda');
  const notifications = useBff('/api/notifications');

  useRealtimeInvalidation({
    '/api/command-center/overview': overview.reload,
    '/api/command-center/agenda': agenda.reload,
    '/api/notifications': notifications.reload,
  });

  const scrollToNotif = () => notifRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Layout
      notificationCount={notifications.data?.total || 0}
      onScrollToNotifications={scrollToNotif}
    >
      <div className="page-header">
        <div>
          <p className="eyebrow">GTM Command Center</p>
          <h1>Your week</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={() => setWidgetsOpen(true)}>Configure widgets</button>
      </div>
      <FreshnessBadge freshness={overview.freshness} />
      {overview.loading && <p className="muted">Loading overview…</p>}
      {overview.error && <p className="error">{overview.error}</p>}
      <KpiStrip kpis={overview.data?.kpis} />
      <ResearchBanner />
      <div className="two-col">
        <AgendaWidget meetings={agenda.data?.meetings} />
        <div ref={notifRef}>
          <NotificationPanel notifications={notifications.data} />
        </div>
      </div>
      <WidgetSettingsModal open={widgetsOpen} onClose={() => setWidgetsOpen(false)} />
    </Layout>
  );
}
