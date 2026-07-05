import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'appearance'>('profile');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    try {
      await updateProfile(data);
    } catch (error) {
      // Error handled by auth context
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      resetPassword();
    } catch (error) {
      // Error handled by auth context
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t.settings.profileTab, icon: User },
    { id: 'password' as const, label: t.settings.passwordTab, icon: Lock },
    { id: 'notifications' as const, label: t.settings.notificationsTab, icon: Bell },
    { id: 'appearance' as const, label: t.settings.appearanceTab, icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t.settings.managePrefs}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.settings.profileInformation}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.fullName}
                  </label>
                  <input
                    {...registerProfile('name')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-danger-500">{profileErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.email}
                  </label>
                  <input
                    {...registerProfile('email')}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-danger-500">{profileErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.phone}
                  </label>
                  <input
                    {...registerProfile('phone')}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-danger-500">{profileErrors.phone.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {isProfileLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t.settings.save}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.settings.changePassword}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.currentPassword}
                  </label>
                  <input
                    {...registerPassword('currentPassword')}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-danger-500">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.newPassword}
                  </label>
                  <input
                    {...registerPassword('newPassword')}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-danger-500">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.settings.confirmPassword}
                  </label>
                  <input
                    {...registerPassword('confirmPassword')}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger-500">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {isPasswordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {t.settings.updatePassword}
                </button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.settings.notificationPreferences}
                </h2>
                {[
                  { label: t.settings.emailNotifications, description: t.settings.emailNotificationsDesc },
                  { label: t.settings.smsAlerts, description: t.settings.smsAlertsDesc },
                  { label: t.settings.pushNotifications, description: t.settings.pushNotificationsDesc },
                  { label: t.settings.weeklyReports, description: t.settings.weeklyReportsDesc },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.settings.appearance}
                </h2>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.settings.darkMode}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.settings.darkModeDesc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
