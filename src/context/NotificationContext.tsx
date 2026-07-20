import React, { createContext, useContext } from 'react';
import { useAppData, DemoNotification } from './AppDataContext';

interface NotificationContextType {
  notifications: DemoNotification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead: markNotificationRead,
      markAllAsRead: markAllNotificationsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
export default NotificationContext;
