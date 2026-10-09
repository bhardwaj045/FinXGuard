import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Send,
  History,
  Bell,
  User,
  Sliders,
  ShieldAlert,
  Cpu,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const userNavItems = [
    { label: 'Dashboard', path: '/user', icon: LayoutDashboard },
    { label: 'Make Transaction', path: '/user/transactions/new', icon: Send },
    { label: 'My Transactions', path: '/user/transactions', icon: History },
    { label: 'Alerts', path: '/user/alerts', icon: Bell },
    { label: 'Profile', path: '/user/profile', icon: User }
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'System Configuration', path: '/admin/configuration', icon: Sliders },
    { label: 'Detection Monitoring', path: '/admin/detection', icon: ShieldAlert },
    { label: 'Algorithm Management', path: '/admin/algorithm', icon: Cpu },
    { label: 'Profile', path: '/admin/profile', icon: User }
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    let logoutError = null;
    try {
      await logout();
    } catch (error) {
      logoutError = error.message;
    }
    navigate('/', { replace: true, state: logoutError ? { logoutError } : null });
  };

  return (
    <aside
      className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)]"
      aria-label="Main Navigation"
    >
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 block mb-2">
            {role === 'ADMIN' ? 'Admin Portal' : 'User Portal'}
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isActive
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 hover:bg-emerald-500/15'
                          : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
