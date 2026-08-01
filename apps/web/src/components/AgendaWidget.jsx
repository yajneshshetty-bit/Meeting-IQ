import { useState } from 'react';
import { ACCOUNT_NAMES } from '../api/client.js';

const TYPE_DOT = {
  opportunity: 'dot-green',
  new_account: 'dot-orange',
  at_risk: 'dot-red',
  internal: 'dot-blue',
};

function meetingDot(meeting) {
  if (meeting.is_live) return 'dot-red';
  if (meeting.meeting_type === 'new_account') return 'dot-orange';
  if (meeting.meeting_type === 'internal') return 'dot-blue';
  return TYPE_DOT.opportunity;
}

function formatDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function AgendaWidget({ meetings }) {
  const [view, setView] = useState('week');
  const sorted = [...(meetings || [])].sort((a, b) => a.start_time.localeCompare(b.start_time));

  const byDay = sorted.reduce((acc, m) => {
    const day = m.start_time?.slice(0, 10) || 'unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  const days = Object.keys(byDay).sort();

  return (
    <section className="panel agenda-panel">
      <div className="panel-header">
        <h2>Weekly agenda</h2>
        <div className="segmented">
          <button type="button" className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
          <button type="button" className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
        </div>
      </div>
      <div className="agenda-legend">
        <span><i className="dot-green" /> opportunity</span>
        <span><i className="dot-orange" /> new account</span>
        <span><i className="dot-red" /> at-risk / LIVE</span>
        <span><i className="dot-blue" /> normal</span>
      </div>
      <div className="agenda-grid">
        {days.length === 0 && <p className="muted">No meetings scheduled</p>}
        {days.map((day) => (
          <div key={day} className="agenda-day">
            <h3>{formatDay(day)}</h3>
            {(view === 'week' || day === days[0]) && byDay[day].map((m) => (
              <article key={m.meeting_id} className="meeting-card">
                <span className={`meeting-dot ${meetingDot(m)}`} />
                <div>
                  <time>{formatTime(m.start_time)}</time>
                  <p>{m.title}</p>
                  {m.is_live && <span className="live-badge">LIVE</span>}
                  {m.meeting_type === 'new_account' && <span className="new-badge">NEW</span>}
                  {m.account_id && <small>{ACCOUNT_NAMES[m.account_id] || m.account_id}</small>}
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
