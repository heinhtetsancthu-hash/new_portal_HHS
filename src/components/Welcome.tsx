import React from 'react';
import { Settings, Wrench, DollarSign, Moon, Sun, LogOut, ShoppingCart, User, Globe } from 'lucide-react';

interface WelcomeProps {
  onEnter: () => void;
  onFinance: () => void;
  onMobileSales: () => void;
  onCEIR: () => void;
  theme: 'original' | 'dark';
  toggleTheme: () => void;
  onSignOut: () => void;
  user?: any;
}

export const Welcome: React.FC<WelcomeProps> = ({ onEnter, onFinance, onMobileSales, onCEIR, theme, toggleTheme, onSignOut, user }) => {
  const isDark = theme === 'dark';

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
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Hein Htet San</h1>
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
            onClick={onCEIR}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
          >
            <Globe size={20} />
            CEIR
          </button>
        </div>
      </div>
    </div>
  );
};
