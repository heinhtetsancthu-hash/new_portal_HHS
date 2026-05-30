import React, { useState, useEffect } from 'react';
import { Settings, Wrench, DollarSign, Moon, Sun } from 'lucide-react';

interface WelcomeProps {
  onEnter: () => void;
  onFinance: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onEnter, onFinance }) => {
  const [theme, setTheme] = useState<'original' | 'dark'>('original');

  useEffect(() => {
    const savedTheme = localStorage.getItem('welcomeTheme') as 'original' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'original' ? 'dark' : 'original';
    setTheme(newTheme);
    localStorage.setItem('welcomeTheme', newTheme);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-300 relative ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-full shadow-sm transition-colors flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
        title={isDark ? "Switch to Original Theme" : "Switch to Dark Theme"}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`p-12 rounded-2xl shadow-xl max-w-md w-full text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border`}>
        <div className="bg-indigo-600 text-white p-4 rounded-full inline-flex mb-6 items-center justify-center shadow-lg shadow-indigo-600/20">
          <Wrench size={48} />
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Hein Htet San</h1>
        <h2 className={`font-semibold tracking-wider text-sm mb-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>REPAIR CENTER PORTAL</h2>
        <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
        </div>
      </div>
    </div>
  );
};
