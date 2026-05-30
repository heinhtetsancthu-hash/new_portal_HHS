import React, { useState } from 'react';
import { Welcome } from './components/Welcome';
import { Layout } from './components/Layout';
import { NewTicket } from './components/NewTicket';
import { TicketList } from './components/TicketList';
import { Settings } from './components/Settings';
import { DataBackup } from './components/DataBackup';
import { Finance } from './components/Finance';

export default function App() {
  const [view, setView] = useState<'welcome' | 'portal' | 'finance'>('welcome');
  const [activePortalView, setActivePortalView] = useState('new');

  if (view === 'welcome') {
    return <Welcome onEnter={() => setView('portal')} onFinance={() => setView('finance')} />;
  }

  if (view === 'finance') {
    return <Finance onBack={() => setView('welcome')} />;
  }

  return (
    <Layout 
      activeView={activePortalView} 
      setActiveView={setActivePortalView}
      onSignOut={() => setView('welcome')}
    >
      {activePortalView === 'new' && <NewTicket />}
      {activePortalView === 'list' && <TicketList />}
      {activePortalView === 'backup' && <DataBackup />}
      {activePortalView === 'settings' && (
        <Settings />
      )}
    </Layout>
  );
}

