import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';

export function Layout({ children, notificationCount, onScrollToNotifications }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Header notificationCount={notificationCount} onScrollToNotifications={onScrollToNotifications} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
