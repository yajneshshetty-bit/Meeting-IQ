import { useUser } from '../context/UserContext.jsx';

const ROLES = [
  { key: 'ae', label: 'AE', userRole: 'ae' },
  { key: 'manager', label: 'Manager', userRole: 'manager' },
  { key: 'se', label: 'SE', userRole: 'se' },
  { key: 'leader', label: 'Leader', userRole: 'leader' },
];

export function RoleSwitcher() {
  const { user, switchRole } = useUser();

  return (
    <div className="role-switcher">
      {ROLES.map(({ key, label, userRole }) => (
        <button
          key={key}
          type="button"
          className={user?.role === userRole ? 'active' : ''}
          onClick={() => switchRole(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
