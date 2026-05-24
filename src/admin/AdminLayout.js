import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClassName = ({ isActive }) =>
  `admin-nav-link${isActive ? ' active' : ''}`;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar card">
        <div className="admin-brand">
          <div className="admin-logo" aria-hidden="true">H</div>
          <div>
            <div className="admin-title">Huse Admin</div>
            <div className="admin-subtitle">Clothing store</div>
          </div>
        </div>

        {/* Logged-in user badge */}
        {user && (
          <div style={{
            margin: '0 0 16px',
            padding: '10px 14px',
            background: 'rgba(133,76,111,0.12)',
            borderRadius: 8,
            fontSize: 12,
          }}>
            <div style={{ fontWeight: 700, color: '#c07fa5' }}>{user.role}</div>
            <div style={{ opacity: 0.75, marginTop: 2 }}>{user.username}</div>
          </div>
        )}

        <nav className="admin-nav">
          <NavLink to="/admin" end className={linkClassName}>Dashboard</NavLink>
          {/* SuperAdmin can see all; Admin can see products & orders */}
          <NavLink to="/admin/products" className={linkClassName}>Products</NavLink>
          <NavLink to="/admin/orders" className={linkClassName}>Orders</NavLink>
        </nav>

        <div className="admin-sidehint">
          Data is stored in your browser (localStorage) for now.
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '10px 14px',
            background: 'transparent',
            border: '1px solid rgba(133,76,111,0.3)',
            borderRadius: 8,
            color: '#c07fa5',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(133,76,111,0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
