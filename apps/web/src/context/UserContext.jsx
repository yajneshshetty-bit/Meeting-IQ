import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { bffFetch, getStoredUserId, setStoredUserId, ROLE_USERS } from '../api/client.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userId, setUserIdState] = useState(getStoredUserId);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bffFetch('/api/me', { userId: id });
      setUser(res.user);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser(userId);
  }, [userId, loadUser]);

  const setUserId = useCallback((id) => {
    setStoredUserId(id);
    setUserIdState(id);
  }, []);

  const switchRole = useCallback((role) => {
    const id = ROLE_USERS[role];
    if (id) setUserId(id);
  }, [setUserId]);

  const value = useMemo(
    () => ({
      userId,
      user,
      loading,
      error,
      setUserId,
      switchRole,
      reload: () => loadUser(userId),
      canExecutive: user?.entitlements?.includes('meetingiq.executive.read'),
      isSupport: user?.role === 'support',
    }),
    [userId, user, loading, error, setUserId, switchRole, loadUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
