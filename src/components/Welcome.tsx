import React, { useEffect, useState } from 'react';
import { Settings, Wrench, DollarSign, Moon, Sun, LogOut, ShoppingCart, User, Globe, ShoppingBag, Calendar, Activity } from 'lucide-react';
import { subscribeToAccessoryOrders } from '../db';
import { auth } from '../firebase';

interface WelcomeProps {
  onEnter: () => void;
  onFinance: () => void;
  onMobileSales: () => void;
  onAccessories: () => void;
  onDailyRecord: () => void;
  onTemperGlass: () => void;
  onBackup: () => void;
  theme: 'original' | 'dark';
  toggleTheme: () => void;
  onSignOut: () => void;
  user?: any;
}

export const Welcome: React.FC<WelcomeProps> = ({ onEnter, onFinance, onMobileSales, onAccessories, onDailyRecord, onTemperGlass, onBackup, theme, toggleTheme, onSignOut, user }) => {
  const isDark = theme === 'dark';
  const [accessoryOrdersCount, setAccessoryOrdersCount] = useState(0);

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth.currentUser) {
      unsubscribe = subscribeToAccessoryOrders((items) => {
        setAccessoryOrdersCount(items.length);
      });
    }
    return () => unsubscribe();
  }, [user]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {user && user.email && (
          <div className={`hidden md:flex px-4 py-2 rounded-lg text-sm font-medium items-center gap-2 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
            <User size={16} />
            {user.email}
          </div>
        )}
        <button 
          onClick={onSignOut}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDark ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'bg-white text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm'}`}
        >
          <LogOut size={16} />
          Sign out
        </button>
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-sm transition-colors flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
          title={isDark ? "Switch to Original Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`p-12 rounded-2xl shadow-xl max-w-md w-full text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border`}>
        <div className="bg-indigo-600 text-white p-4 rounded-full inline-flex mb-6 items-center justify-center shadow-lg shadow-indigo-600/20">
          <Wrench size={48} />
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>HHS Management System</h1>
        <h2 className={`font-semibold tracking-wider text-sm mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>REPAIR CENTER PORTAL</h2>
        
        {user && user.email && (
           <div className={`mb-6 text-sm py-2 px-3 inline-flex items-center gap-2 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
             <User size={14} />
             {user.email}
           </div>
        )}

        <p className={`mb-8 flex flex-col gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Welcome to the business portal. Manage your repair tickets, upload device photos, and store data securely in the local database.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onEnter}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Settings size={20} />
            Service Portal
          </button>
          
          <button 
            onClick={onFinance}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
          >
            <DollarSign size={20} />
            Finance
          </button>
          
          <button 
            onClick={onMobileSales}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
          >
            <ShoppingCart size={20} />
            Mobile Sales
          </button>
          
          <button 
            onClick={onAccessories}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
          >
            <div className="flex items-center gap-2 relative">
               <ShoppingBag size={20} />
               AccessoriesOrder
               {accessoryOrdersCount > 0 && (
                 <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                   {accessoryOrdersCount}
                 </span>
               )}
            </div>
          </button>
          
          <button 
            onClick={onDailyRecord}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
          >
            <Calendar size={20} />
            Daily Record
          </button>
          
          <button 
            onClick={onTemperGlass}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            <Activity size={20} />
            TemperGlass
          </button>
          
          <button 
            onClick={onBackup}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-database-backup"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12c0 1.18 2.03 2.2 5 2.7M21 5v4.5c0 .76-.64 1.43-1.6 2M3 5v14c0 1.66 4 3 9 3 1.25 0 2.45-.15 3.5-.4"/><path d="M22 17.5c0 1.4-1.1 2.5-2.5 2.5h-5.4l1.3 1.3"/><path d="M15.4 16.2l-1.3 1.3"/></svg>
            Backup
          </button>
        </div>
      </div>
    </div>
  );
};
