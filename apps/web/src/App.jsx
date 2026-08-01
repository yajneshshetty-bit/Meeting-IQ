import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './context/UserContext.jsx';
import { CommandCenterPage } from './pages/CommandCenter.jsx';
import { ExecutiveViewPage } from './pages/ExecutiveView.jsx';
import { SupportViewPage } from './pages/SupportView.jsx';

export default function App() {
  const { loading, error, isSupport } = useUser();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-trigger')?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return <div className="loading-screen">Loading MeetingIQ…</div>;
  if (error) return <div className="loading-screen error">Auth error: {error}</div>;

  return (
    <Routes>
      <Route path="/" element={isSupport ? <Navigate to="/support" replace /> : <CommandCenterPage />} />
      <Route path="/executive" element={<ExecutiveViewPage />} />
      <Route path="/support" element={<SupportViewPage />} />
      <Route path="*" element={<Navigate to={isSupport ? '/support' : '/'} replace />} />
    </Routes>
  );
}
