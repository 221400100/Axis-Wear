import React, { useContext } from 'react';
import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Grid, ShoppingCart, Users, LogOut, Settings, Bell } from 'lucide-react';

const AdminLayout = () => {
  const { admin, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!admin || admin.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: Grid },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--glass-border)', borderRadius: '0' }}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <img src="/logo.jpeg" alt="" className="logo-image" style={{ height: '35px', width: 'auto' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ margin: 0, letterSpacing: '2px', fontWeight: 800, lineHeight: '1', fontSize: '1.25rem' }} className="text-gradient">AXIS</h2>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Admin portal</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-secondary" style={{ margin: 0, fontSize: '0.85rem' }}>Logged in as</p>
            <p style={{ margin: '0.35rem 0 0', fontWeight: 700 }}>{admin?.email || 'Administrator'}</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  justifyContent: 'flex-start',
                  background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  textDecoration: 'none'
                })}
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="btn"
          style={{ justifyContent: 'flex-start', color: 'var(--danger)', marginTop: 'auto', padding: '0.85rem 1rem' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
