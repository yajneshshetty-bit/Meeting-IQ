import { useState } from 'react';
import { RoleSwitcher } from './RoleSwitcher.jsx';
import { SearchModal } from './SearchModal.jsx';
import { useUser } from '../context/UserContext.jsx';

export function Header({ notificationCount = 0, onScrollToNotifications }) {
  const { user } = useUser();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)}>
          Ask anything about your deals… <kbd>⌘K</kbd>
        </button>
        <RoleSwitcher />
        <button type="button" className="notif-bell" onClick={onScrollToNotifications} title="Notifications">
          🔔
          {notificationCount > 0 && <span className="notif-count">{notificationCount}</span>}
        </button>
        <div className="user-chip">
          <span className="avatar">{user?.display_name?.[0] || '?'}</span>
          <span>{user?.display_name}</span>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
