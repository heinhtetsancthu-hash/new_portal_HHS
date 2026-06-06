import React, { useEffect, useState } from 'react';
import { subscribeToNewNotifications, NotificationItem } from '../db';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export const GlobalNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNewNotifications((notification) => {
      setNotifications(prev => [...prev, notification]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });

    return () => unsubscribe();
  }, []);

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className="bg-white px-4 py-3 rounded-lg shadow-xl border border-slate-200 pointer-events-auto flex items-center justify-between gap-4 max-w-sm w-full animate-in slide-in-from-right-8"
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${
              notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> :
               notification.type === 'warning' ? <AlertTriangle size={16} /> :
               <Info size={16} />}
            </div>
            <p className="text-sm font-medium text-slate-700">{notification.message}</p>
          </div>
          <button 
            onClick={() => dismiss(notification.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
