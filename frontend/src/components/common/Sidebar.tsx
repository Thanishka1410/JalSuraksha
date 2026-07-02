import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  Droplets,
  AlertTriangle,
  BarChart3,
  Map,
  Bell,
  Bot,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ClipboardList,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';


interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'] },
  { path: '/infrastructure', label: 'Infrastructure', icon: Wrench, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'district_officer'] },
  { path: '/quality', label: 'Water Quality', icon: Droplets, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'] },
  { path: '/complaints', label: 'Complaints', icon: ClipboardList, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'] },
  { path: '/schedule', label: 'Schedule', icon: CalendarClock, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'district_officer'] },
  { path: '/maps', label: 'Maps', icon: Map, roles: ['super_admin', 'gp_admin', 'district_officer'] },
  { path: '/alerts', label: 'Alerts', icon: Bell, roles: ['super_admin', 'gp_admin', 'district_officer'] },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'district_officer'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'] },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              JalRakshak
            </span>
          </motion.div>
        )}
        <button
          onClick={isMobileOpen ? onMobileClose : onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {allNavItems
          .filter((item) => user?.role && item.roles.includes(user.role))
          .map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobileOpen ? onMobileClose : undefined}
              className={({ isActive: linkActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </motion.div>
          )}
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {/* @ts-ignore */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
