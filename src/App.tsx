import React, { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { Layout } from './components/Layout';
import { NewTicket } from './components/NewTicket';
import { TicketList } from './components/TicketList';
import { Settings } from './components/Settings';
import { DataBackup } from './components/DataBackup';
import { Finance } from './components/Finance';
import { MobileSales } from './components/MobileSales';
import { BuySparepart } from './components/BuySparepart';
import { BuyAccessories } from './components/BuyAccessories';
import { SparepartStock } from './components/SparepartStock';
import { DailyRecord } from './components/DailyRecord';
import { TemperGlass } from './components/TemperGlass';
import { GlobalNotifications } from './components/GlobalNotifications';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Ticket } from './types';

export default function App() {
  const [view, setView] = useState<'welcome' | 'portal' | 'finance' | 'mobileSales' | 'accessories' | 'dailyRecord' | 'temperGlass'>('welcome');
  const [activePortalView, setActivePortalView] = useState('list');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [theme, setTheme] = useState<'original' | 'dark'>('original');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('welcomeTheme') as 'original' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const allowedEmails = ['heinhtetsancthu@gmail.com', 'cthupinephyo@gmail.com'];
        if (!allowedEmails.includes(currentUser.email || '')) {
          await auth.signOut();
          setAuthError('Unauthorized email address.');
          setUser(null);
        } else {
          setUser(currentUser);
          setAuthError(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'original' ? 'dark' : 'original';
    setTheme(newTheme);
    localStorage.setItem('welcomeTheme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      setAuthError(null);
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email || '';
      const allowedEmails = ['heinhtetsancthu@gmail.com', 'cthupinephyo@gmail.com'];
      
      if (!allowedEmails.includes(email)) {
        await auth.signOut();
        setAuthError('Unauthorized email address. Access denied.');
        setUser(null);
      }
    } catch (error: any) {
      console.error("Sign in failed", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message || 'Sign in failed');
      }
    }
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-300 relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`p-12 rounded-2xl shadow-xl max-w-md w-full text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border`}>
          <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Repair Center</h1>
          <p className={`mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to sync your data across devices securely.</p>
          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {authError}
            </div>
          )}
          <button
            onClick={handleSignIn}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const handleAppSignOut = async () => {
    try {
      await auth.signOut();
      setView('welcome');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const renderView = () => {
    if (view === 'welcome') {
      return <Welcome onEnter={() => { setView('portal'); setActivePortalView('list'); }} onFinance={() => setView('finance')} onMobileSales={() => setView('mobileSales')} onAccessories={() => setView('accessories')} onDailyRecord={() => setView('dailyRecord')} onTemperGlass={() => setView('temperGlass')} onBackup={() => { setView('portal'); setActivePortalView('backup'); }} theme={theme} toggleTheme={toggleTheme} onSignOut={handleAppSignOut} user={user} />;
    }

    if (view === 'finance') {
      return <Finance onBack={() => setView('welcome')} />;
    }

    if (view === 'mobileSales') {
      return <MobileSales onBack={() => setView('welcome')} />;
    }

    if (view === 'accessories') {
      return <BuyAccessories onBack={() => setView('welcome')} />;
    }

    if (view === 'dailyRecord') {
      return <DailyRecord onBack={() => setView('welcome')} />;
    }

    if (view === 'temperGlass') {
      return <TemperGlass onBack={() => setView('welcome')} />;
    }

    return (
      <Layout 
        activeView={activePortalView} 
        setActiveView={(nextView) => {
          setActivePortalView(nextView);
          if (nextView !== 'new') setEditingTicket(null);
        }}
        onBack={() => setView('welcome')}
      >
        {activePortalView === 'new' && <NewTicket editingTicket={editingTicket} onSaveComplete={() => { setEditingTicket(null); setActivePortalView('list'); }} />}
        {activePortalView === 'list' && <TicketList onEditTicket={(ticket) => { setEditingTicket(ticket); setActivePortalView('new'); }} />}
        {activePortalView === 'buy_sparepart' && <BuySparepart />}
        {activePortalView === 'sparepart_stock' && <SparepartStock />}
        {activePortalView === 'backup' && <DataBackup />}
        {activePortalView === 'settings' && (
          <Settings />
        )}
      </Layout>
    );
  };

  return (
    <>
      <GlobalNotifications />
      {renderView()}
    </>
  );
}
