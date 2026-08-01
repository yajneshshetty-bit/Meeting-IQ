import { useMemo, useState } from 'react';

export function NotificationPanel({ notifications, id = 'notifications' }) {
  const [urgency, setUrgency] = useState('all');
  const [type, setType] = useState('all');
  const [groupBy, setGroupBy] = useState('urgency');

  const filtered = useMemo(() => {
    let items = notifications?.items || [];
    if (urgency !== 'all') items = items.filter((i) => i.urgency === urgency);
    if (type !== 'all') items = items.filter((i) => i.type === type);
    return items;
  }, [notifications, urgency, type]);

  const groups = useMemo(() => {
    if (groupBy === 'none') return { All: filtered };
    return filtered.reduce((acc, item) => {
      const key = groupBy === 'urgency' ? item.urgency : item.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered, groupBy]);

  const urgentCount = (notifications?.items || []).filter((i) => i.urgency === 'urgent').length;

  return (
    <section className="panel notif-panel" id={id}>
      <div className="panel-header">
        <h2>⚡ Respond now — {urgentCount} of {notifications?.total || 0}</h2>
      </div>
      <div className="filter-row">
        <div>
          <span className="filter-label">Urgency</span>
          {['all', 'urgent', 'soon', 'later'].map((u) => (
            <button key={u} type="button" className={urgency === u ? 'active' : ''} onClick={() => setUrgency(u)}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>
        <div>
          <span className="filter-label">Type</span>
          {['all', 'sla', 'risk', 'connectors'].map((t) => (
            <button key={t} type="button" className={type === t ? 'active' : ''} onClick={() => setType(t)}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div>
          <span className="filter-label">Group by</span>
          {['urgency', 'type', 'none'].map((g) => (
            <button key={g} type="button" className={groupBy === g ? 'active' : ''} onClick={() => setGroupBy(g)}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="notif-group">
          <h3>{group} <span>{items.length}</span></h3>
          <ul>
            {items.map((item) => (
              <li key={item.id} className={`notif-item urgency-${item.urgency}`}>
                <span className="notif-type">{item.type}</span>
                <div>
                  <strong>{item.title}</strong>
                  {item.subtitle && <small>{item.subtitle}</small>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
