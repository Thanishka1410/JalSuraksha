import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n, Language } from '../../contexts/I18nContext';
import { getInitials } from '../../utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
}

const getPageTitleKey = (path: string): string => {
  const map: Record<string, string> = {
    '/dashboard': 'dashboard.title',
    '/infrastructure': 'infrastructure.title',
    '/quality': 'quality.title',
    '/complaints': 'complaints.title',
    '/analytics': 'analytics.title',
    '/maps': 'maps.title',
    '/alerts': 'alerts.title',
    '/ai-assistant': 'aiAssistant.title',
    '/settings': 'settings.title',
  };
  if (map[path]) return map[path];
  const basePath = '/' + path.split('/')[1];
  return map[basePath] || 'JalRakshak AI';
};

const Header: React.FC<HeaderProps> = ({ onMenuClick, notificationCount = 0 }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, t, setLanguage } = useI18n();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    const path = location.pathname;
    const key = getPageTitleKey(path);
    if (key === 'JalRakshak AI') return key;
    const keys = key.split('.');
    let val: any = t;
    for (const k of keys) val = val?.[k];
    return val || key;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: '1', title: 'Low water level in Tank A', time: '5 min ago', read: false },
    { id: '2', title: 'Pump P-001 needs maintenance', time: '1 hour ago', read: false },
    { id: '3', title: 'New complaint received', time: '2 hours ago', read: true },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            {/* @ts-ignore */}
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 256, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex items-center"
                >
                  <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.common.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </motion.div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t.settings.theme}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              title={t.settings.language}
              id="language-switcher-btn"
            >
              <span className="text-base">
                {language === 'en' ? '🇬🇧' : language === 'te' ? '🇮🇳' : '🇮🇳'}
              </span>
              <span className="hidden sm:block uppercase tracking-wide">{language}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* @ts-ignore */}
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  {(['en', 'te', 'hi'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setIsLangMenuOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                        language === lang
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      id={`lang-${lang}`}
                    >
                      <span>{lang === 'en' ? '🇬🇧' : '🇮🇳'}</span>
                      <span>{t.languages[lang]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* @ts-ignore */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.settings.notifications}</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                          !notification.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 text-center">
                    <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                      {t.alerts.title}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {user ? getInitials(user.name) : 'U'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300 hidden sm:block" />
            </button>

            {/* @ts-ignore */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.location.href = '/settings';
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <User className="w-4 h-4" />
                      {t.settings.profile}
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.location.href = '/settings';
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      {t.settings.title}
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
