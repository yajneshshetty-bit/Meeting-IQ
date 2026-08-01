import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export function Sidebar() {
  const { canExecutive, isSupport } = useUser();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">MIQ</div>
      <nav className="sidebar-nav">
        {!isSupport && (
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} title="Command Center">
            <span className="icon">▦</span>
          </NavLink>
        )}
        {canExecutive && (
          <NavLink to="/executive" className={({ isActive }) => (isActive ? 'active' : '')} title="Executive Pipeline">
            <span className="icon">♛</span>
          </NavLink>
        )}
        {isSupport && (
          <NavLink to="/support" className={({ isActive }) => (isActive ? 'active' : '')} title="Support Diagnostics">
            <span className="icon">⚙</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
