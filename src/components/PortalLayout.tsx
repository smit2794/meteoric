import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Monitor, ShieldCheck, Bell, LogOut, 
  Building, Contact, Layers, CheckSquare, Settings2, Menu, X, ChevronDown, ChevronRight, User, Settings, Lock, Ticket, HelpCircle
} from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { demoRole, setDemoRole } = useAppData();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Define department scoped menu links
  const itLinks = [
    { title: 'IT Dashboard', icon: LayoutDashboard, path: '/portal/it-department' },
    { title: 'IT Asset Management', icon: Monitor, path: '/portal/it-department/assets' },
    { title: 'IT Incident Management', icon: HelpCircle, path: '/portal/it-department/incidents' },
    { title: 'Service Requests', icon: Layers, path: '/portal/it-department/service-requests' },
    { title: 'User Access Management', icon: User, path: '/portal/it-department/user-access' },
    { title: 'IT Policies & SOPs', icon: CheckSquare, path: '/portal/it-department/policies' },
    { title: 'License Management', icon: Settings2, path: '/portal/it-department/licenses' },
    { title: 'Ticketing System', icon: Ticket, path: '/portal/it-department/tickets' },
  ];

  const adminLinks = [
    { title: 'Admin Dashboard', icon: LayoutDashboard, path: '/portal/admin-department' },
    { title: 'Vendor Management', icon: Building, path: '/portal/admin-department/vendors' },
    { title: 'Stationery Management', icon: Layers, path: '/portal/admin-department/stationery' },
    { title: 'Travel Bookings', icon: HelpCircle, path: '/portal/admin-department/travel' },
    { title: 'Courier Management', icon: Monitor, path: '/portal/admin-department/courier' },
    { title: 'Inward & Outward Register', icon: CheckSquare, path: '/portal/admin-department/inward-outward' },
  ];

  const salesLinks = [
    { title: 'Sales Dashboard', icon: LayoutDashboard, path: '/portal/sales-team' },
    { title: 'Sales CRM', icon: Contact, path: '/portal/sales-team/crm' },
    { title: 'Quotation Management', icon: Layers, path: '/portal/sales-team/quotations' },
    { title: 'Sales Module (COA)', icon: ShieldCheck, path: '/portal/sales-team/coa' },
  ];

  const qaLinks = [
    { title: 'QA Dashboard', icon: LayoutDashboard, path: '/portal/qa-team' },
    { title: 'COA Builder', icon: ShieldCheck, path: '/portal/qa-team/coa-builder' },
    { title: 'COA Requests', icon: HelpCircle, path: '/portal/qa-team/coa-requests' },
  ];

  const qmsLinks = [
    { title: 'QMS Dashboard', icon: LayoutDashboard, path: '/portal/qms-team' },
    { title: 'SOP & Documentation', icon: CheckSquare, path: '/portal/qms-team/sop-documentation' },
    { title: 'Audit Management', icon: ShieldCheck, path: '/portal/qms-team/audit-management' },
    { title: 'NC & CAPA Tracker', icon: HelpCircle, path: '/portal/qms-team/ncs' },
  ];

  const getActiveDepartment = () => {
    const path = location.pathname;
    if (path.startsWith('/portal/it-department')) return { name: 'IT Department', links: itLinks, tag: 'IT PORTAL', roleKey: 'IT Department' };
    if (path.startsWith('/portal/admin-department')) return { name: 'Admin Department', links: adminLinks, tag: 'ADMIN PORTAL', roleKey: 'Admin Department' };
    if (path.startsWith('/portal/sales-team')) return { name: 'Sales Team', links: salesLinks, tag: 'SALES PORTAL', roleKey: 'Sales Team' };
    if (path.startsWith('/portal/qa-team')) return { name: 'QA Team', links: qaLinks, tag: 'QA PORTAL', roleKey: 'QA Team' };
    if (path.startsWith('/portal/qms-team')) return { name: 'QMS Team', links: qmsLinks, tag: 'QMS PORTAL', roleKey: 'QMS Team' };
    return { name: 'Meteoric Portal', links: [], tag: 'BIOPHARMA', roleKey: '' };
  };

  const dept = getActiveDepartment();
  const isActiveRoleMatched = demoRole === 'Super Admin' || demoRole === dept.roleKey;

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return ['Home', 'Main Dashboard'];
    const activeLink = dept.links.find(link => link.path === path);
    return activeLink ? [dept.name, activeLink.title] : [dept.name];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleNotificationClick = (link: string, notifId: number) => {
    markAsRead(notifId);
    setNotifDropdownOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] flex">
      {/* Sidebar - Mobile */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
          
          {/* Content */}
          <aside className="relative flex flex-col w-64 bg-[#1b4332] text-[#95b0a4] select-none h-full shadow-xl">
            {/* Close button */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-[#153427] bg-[#122e22]">
              <img
                src="/logo.png"
                alt="Meteoric Biopharmaceuticals"
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </div>

            {/* Back to Home Link */}
            <div className="px-4 pt-4 pb-2">
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/80 hover:bg-[#153427]"
              >
                <span>← Exit to Hub</span>
              </Link>
              <div className="h-px bg-[#153427] mt-3" />
            </div>

            {/* Navigation links */}
            <nav className="flex-1 py-4 px-4 overflow-y-auto space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[#6c8f7c] uppercase block px-3 mb-2">{dept.name} Modules</span>
              {dept.links.map(item => {
                const isActive = item.path === location.pathname;
                const isDisabled = !isActiveRoleMatched;
                return (
                  <Link
                    key={item.title}
                    to={isDisabled ? '#' : item.path}
                    onClick={(e) => {
                      if (isDisabled) e.preventDefault();
                      else setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#dc5f5f] text-white font-extrabold shadow-sm' 
                        : isDisabled 
                          ? 'opacity-45 cursor-not-allowed text-[#6c8f7c]'
                          : 'hover:bg-[#153427] hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6c8f7c]'}`} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1b4332] border-r border-[#1b4332] text-[#95b0a4] select-none shrink-0">
        {/* Logo Header */}
        <div className="h-16 flex items-center px-4 border-b border-[#153427] bg-[#122e22]">
          <img
            src="/logo.png"
            alt="Meteoric Biopharmaceuticals"
            className="h-9 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* Back to Home Link */}
        <div className="px-4 pt-4 pb-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/80 hover:bg-[#153427] transition-colors"
          >
            <span>← Exit to Hub</span>
          </Link>
          <div className="h-px bg-[#153427] mt-3" />
        </div>

        {/* Navigation links - Scoped list */}
        <nav className="flex-1 py-4 px-4 overflow-y-auto space-y-1">
          <span className="text-[10px] font-extrabold tracking-widest text-[#6c8f7c] uppercase block px-3 mb-2">{dept.name} Modules</span>
          
          {dept.links.map(item => {
            const isActive = item.path === location.pathname;
            const isDisabled = !isActiveRoleMatched;

            return (
              <Link
                key={item.title}
                to={isDisabled ? '#' : item.path}
                onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#dc5f5f] text-white font-extrabold shadow-sm' 
                    : isDisabled 
                      ? 'opacity-40 cursor-not-allowed text-[#6c8f7c]'
                      : 'hover:bg-[#153427] hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6c8f7c]'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

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

            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Meteoric Biopharmaceuticals"
                className="h-8 w-auto object-contain hidden sm:block"
              />
              
              <span className="px-2.5 py-0.5 border border-[#dc5f5f] text-[#dc5f5f] text-[9px] font-extrabold uppercase rounded-full tracking-wide">
                {dept.tag}
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
                <option value="Super Admin">Super Admin</option>
                <option value="IT Department">IT Department</option>
                <option value="Admin Department">Admin Department</option>
                <option value="Sales Team">Sales Team</option>
                <option value="QA Team">QA Team</option>
                <option value="QMS Team">QMS Team</option>
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

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#dc5f5f] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  SA
                </div>
                <div className="hidden sm:block text-left select-none leading-tight">
                  <div className="text-xs font-bold text-slate-800">Demo User</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{demoRole}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5">
                    <button 
                      onClick={() => { setUserDropdownOpen(false); navigate('/'); }}
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
          {isActiveRoleMatched ? (
            children
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Access Gated</h2>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Your currently selected demo role is **{demoRole}**. This portal requires the **{dept.roleKey}** or **Super Admin** role to access.
              </p>
              <button 
                onClick={() => setDemoRole(dept.roleKey as any)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Switch Role to {dept.roleKey}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
