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
          <div className="admin-user-pill">
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{user.role}</div>
            <div style={{ opacity: 0.8, marginTop: 2 }}>{user.username}</div>
          </div>
        )}

        <nav className="admin-nav">
          <NavLink to="/admin" end className={linkClassName}>Dashboard</NavLink>
          {/* SuperAdmin can see all; Admin can see products & orders */}
          <NavLink to="/admin/products" className={linkClassName}>Products</NavLink>
          <NavLink to="/admin/orders" className={linkClassName}>Orders</NavLink>
          <NavLink to="/admin/messages" className={linkClassName}>Messages</NavLink>
          <NavLink to="/" className={linkClassName}>Home</NavLink>
        </nav>

        <div className="admin-sidehint">
          Data is loaded from the backend API (products/orders). Expenses remain local for now.
        </div>

        {/* Logout */}
        <button
          className="btn admin-action-btn"
          onClick={handleLogout}
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

