import { useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';
import { FreshnessBadge } from './FreshnessBadge.jsx';

export function WidgetSettingsModal({ open, onClose }) {
  const { userId } = useUser();
  const [configs, setConfigs] = useState([]);
  const [freshness, setFreshness] = useState(null);
  const [widgetKey, setWidgetKey] = useState('pipeline_kpi');
  const [view, setView] = useState('command_center');

  async function load() {
    const res = await bffFetch('/api/widgets/config', { userId });
    setConfigs(res.data?.configs || []);
    setFreshness(res.freshness);
  }

  async function save() {
    await bffFetch('/api/widgets/config', {
      userId,
      method: 'PUT',
      body: { view, widget_key: widgetKey, layout: { visible: true }, settings: { pinned: true } },
    });
    await load();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="widget-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>Widget configuration</h2>
        <FreshnessBadge freshness={freshness} />
        <div className="form-row">
          <label>
            View
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="command_center">Command Center</option>
              <option value="executive">Executive</option>
            </select>
          </label>
          <label>
            Widget
            <input value={widgetKey} onChange={(e) => setWidgetKey(e.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={load}>Load</button>
          <button type="button" onClick={save}>Save</button>
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
        </div>
        <ul>
          {configs.map((c) => (
            <li key={c.config_id}>{c.view} · {c.widget_key}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
