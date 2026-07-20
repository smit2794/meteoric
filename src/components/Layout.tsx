import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Laptop, ShieldCheck, Bell, LogOut, 
  Building, Contact, Layers, CheckSquare, Settings2, Menu, X, ChevronDown, ChevronRight, User, Settings, Type
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { demoRole, setDemoRole, fontSize, setFontSize } = useAppData();
  const { user, logout, hasModuleAccess } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Unified Flat menu items
  const menuItems = [
    // OPERATIONS
    { title: 'Global Dashboard', icon: LayoutDashboard, path: '/dashboard', module: 'dashboard', category: 'OPERATIONS' },
    
    // IT Asset Management
    { title: 'IT Dashboard', icon: Laptop, path: '/it', module: 'it', category: 'OPERATIONS' },
    { title: 'Asset Inventory', icon: Laptop, path: '/it/assets', module: 'it', category: 'OPERATIONS' },
    { title: 'Incidents & Tickets', icon: Laptop, path: '/it/incidents', module: 'it', category: 'OPERATIONS' },
    { title: 'Service Requests', icon: Laptop, path: '/it/requests', module: 'it', category: 'OPERATIONS' },
    { title: 'Access Control', icon: Laptop, path: '/it/access', module: 'it', category: 'OPERATIONS' },
    { title: 'IT Policies & SOPs', icon: Laptop, path: '/it/documents', module: 'it', category: 'OPERATIONS' },
    { title: 'License SLA Tracker', icon: Laptop, path: '/it/licenses', module: 'it', category: 'OPERATIONS' },
    
    // Admin Module
    { title: 'Admin Dashboard', icon: Building, path: '/admin', module: 'admin', category: 'OPERATIONS' },
    { title: 'Vendor Management', icon: Building, path: '/admin/vendors', module: 'admin', category: 'OPERATIONS' },
    { title: 'Stationery & Items', icon: Building, path: '/admin/stationery', module: 'admin', category: 'OPERATIONS' },
    { title: 'Travel Bookings', icon: Building, path: '/admin/travel', module: 'admin', category: 'OPERATIONS' },
    { title: 'Courier Management', icon: Building, path: '/admin/couriers', module: 'admin', category: 'OPERATIONS' },
    { title: 'Inward/Outward Log', icon: Building, path: '/admin/register', module: 'admin', category: 'OPERATIONS' },

    // SALES & CRM
    { title: 'Sales Dashboard', icon: Contact, path: '/crm', module: 'crm', category: 'SALES & CRM' },
    { title: 'Leads Directory', icon: Contact, path: '/crm/leads', module: 'crm', category: 'SALES & CRM' },
    { title: 'Kanban Pipeline', icon: Contact, path: '/crm/pipeline', module: 'crm', category: 'SALES & CRM' },
    { title: 'Quotations Table', icon: Contact, path: '/crm/quotations', module: 'crm', category: 'SALES & CRM' },
    
    // QA Module
    { title: 'QA Dashboard', icon: ShieldCheck, path: '/qa', module: 'qa', category: 'SALES & CRM' },
    { title: 'COA Requests', icon: ShieldCheck, path: '/qa/requests', module: 'qa', category: 'SALES & CRM' },
    { title: 'COA Certification Log', icon: ShieldCheck, path: '/qa/coas', module: 'qa', category: 'SALES & CRM' },
    
    // Sales Fulfillment
    { title: 'Orders Table', icon: Layers, path: '/sales/orders', module: 'sales', category: 'SALES & CRM' },

    // COMPLIANCE & UTILS
    { title: 'QMS Dashboard', icon: CheckSquare, path: '/qms', module: 'qms', category: 'COMPLIANCE & UTILS' },
    { title: 'SOP & Documents', icon: CheckSquare, path: '/qms/docs', module: 'qms', category: 'COMPLIANCE & UTILS' },
    { title: 'Audit Scheduling', icon: CheckSquare, path: '/qms/audits', module: 'qms', category: 'COMPLIANCE & UTILS' },
    { title: 'NC & CAPA Tracker', icon: CheckSquare, path: '/qms/ncs', module: 'qms', category: 'COMPLIANCE & UTILS' },
    
    // Settings
    { title: 'Users Registry', icon: Settings2, path: '/settings/users', module: 'settings', category: 'COMPLIANCE & UTILS' },
    { title: 'Roles Permissions', icon: Settings2, path: '/settings/permissions', module: 'settings', category: 'COMPLIANCE & UTILS' },
    { title: 'Alert Preferences', icon: Settings2, path: '/settings/notifications', module: 'settings', category: 'COMPLIANCE & UTILS' }
  ];

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return ['Home', 'Main Dashboard'];

    for (const item of menuItems) {
      if (item.path === path) return [item.title];
    }
    return ['Portal'];
  };

  const getActivePortalTag = () => {
    const path = location.pathname;
    if (path.startsWith('/it') || path.startsWith('/tickets')) return 'IT PORTAL';
    if (path.startsWith('/admin')) return 'ADMIN PORTAL';
    if (path.startsWith('/crm')) return 'CRM PORTAL';
    if (path.startsWith('/qa')) return 'QA PORTAL';
    if (path.startsWith('/sales')) return 'FULFILLMENT PORTAL';
    if (path.startsWith('/qms')) return 'QMS PORTAL';
    if (path.startsWith('/settings')) return 'SETTINGS PORTAL';
    return 'OS PORTAL';
  };

  const getUserInitials = () => {
    if (!user?.name) return 'ME';
    return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const breadcrumbs = getBreadcrumbs();
  const portalTag = getActivePortalTag();

  const handleNotificationClick = (link: string, notifId: number) => {
    markAsRead(notifId);
    setNotifDropdownOpen(false);
    if (link) navigate(link);
  };

  const categories = ['OPERATIONS', 'SALES & CRM', 'COMPLIANCE & UTILS'];

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1b4332] border-r border-[#1b4332] text-[#95b0a4] select-none shrink-0">
        {/* Circle Plus Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#153427] bg-[#122e22]">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[#1b4332] text-xl shadow-xs shrink-0">
            +
          </div>
          <span className="font-extrabold text-white text-base tracking-tight shrink-0">Meteoric OS</span>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-5">
          {categories.map(cat => {
            const catItems = menuItems.filter(item => item.category === cat);
            const visibleItems = catItems.filter(item => hasModuleAccess(item.module));
            if (visibleItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-widest text-[#6c8f7c] uppercase block px-3 mb-2">{cat}</span>
                
                {visibleItems.map(item => {
                  const isActive = item.path === location.pathname;

                  return (
                    <Link
                      key={item.title}
                      to={item.path}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-[#dc5f5f] text-white font-extrabold shadow-sm' 
                          : 'hover:bg-[#153427] hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6c8f7c]'}`} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Exit to Selector Link */}
        <div className="p-4 border-t border-[#153427] mt-auto">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#84a994] hover:text-rose-400 transition-colors w-full text-left"
          >
            <span>← Exit to Selector</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#1b4332]/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <aside 
            className="w-64 h-full bg-[#1b4332] flex flex-col text-[#95b0a4]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#153427] bg-[#122e22]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#1b4332] text-xl">
                  +
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">Meteoric OS</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5 text-[#84a994]" />
              </button>
            </div>
            
            <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-2">
              {menuItems.map((item) => {
                if (!hasModuleAccess(item.module)) return null;
                const isActive = item.path === location.pathname;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                      isActive ? 'bg-[#dc5f5f] text-white font-extrabold' : 'hover:bg-[#153427]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#153427] mt-auto">
              <button
                onClick={() => { logout(); setMobileSidebarOpen(false); navigate('/'); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#84a994] hover:text-rose-400 transition-colors w-full text-left"
              >
                <span>← Exit to Selector</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left part: Hamburger menu & Portal Badge */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Clinic / Enterprise title + portal tag outline */}
            <div className="flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-slate-400" />
              <span className="font-bold text-slate-700 text-sm hidden sm:block">Meteoric Biopharma</span>
              
              <span className="px-2.5 py-0.5 border border-[#dc5f5f] text-[#dc5f5f] text-[9px] font-extrabold uppercase rounded-full tracking-wide">
                {portalTag}
              </span>
            </div>
          </div>

          {/* Right part: Actions, Role Selector Dropdown, Notifications bell, user profile */}
          <div className="flex items-center gap-4">
            
            {/* Live demo role selector */}
            <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-full transition-colors">
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 pl-1">Role:</span>
              <select
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value as any)}
                className="bg-transparent border-0 text-[10px] font-bold text-slate-700 focus:ring-0 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            {/* Font Size selector */}
            <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full transition-colors">
              <Type className="w-3 h-3 text-slate-400 pl-0.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Size:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="bg-transparent border-0 text-[10px] font-bold text-slate-700 focus:ring-0 focus:outline-none cursor-pointer pr-1"
              >
                <option value="sm">Small</option>
                <option value="base">Normal</option>
                <option value="lg">Large</option>
                <option value="xl">X-Large</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification drop menu */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.link, n.id)}
                            className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-slate-50/70 font-medium' : ''}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#dc5f5f]' : 'bg-transparent'}`} />
                              <div>
                                <h4 className="text-xs text-slate-800 font-bold">{n.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Red Circle Initials Badge */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#dc5f5f] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {getUserInitials()}
                </div>
                <div className="hidden sm:block text-left select-none leading-tight">
                  <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{user?.role} Mode</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5">
                    <button 
                      onClick={() => { logout(); setUserDropdownOpen(false); navigate('/'); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Exit to Hub</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-8 pt-4 select-none">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                <span className={idx === breadcrumbs.length - 1 ? "text-slate-700 font-extrabold" : "text-slate-400"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
