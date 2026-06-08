import React, { useState, useEffect } from 'react';
import { PlusCircle, List, Database, Settings, ArrowLeft, Menu, X, ShoppingCart } from 'lucide-react';
import { getTickets, subscribeToSpareparts } from '../db';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  onBack: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, onBack }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sparepartsCount, setSparepartsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSpareparts((items) => {
      setSparepartsCount(items.length);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: 'new', label: 'New Ticket', icon: PlusCircle },
    { id: 'list', label: 'Ticket List', icon: List },
    { id: 'buy_sparepart', label: 'Buy Sparepart', icon: ShoppingCart },
    { id: 'backup', label: 'Data Backup', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleBackClick = () => {
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform z-40 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-100 mt-12 lg:mt-0">
          <h1 className="text-xl font-bold text-slate-800">Hein Htet San</h1>
          <h2 className="text-indigo-600 text-[10px] font-bold tracking-widest mt-1 uppercase">Repair Center</h2>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#EEF2FF] text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </div>
                {item.id === 'buy_sparepart' && sparepartsCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center justify-center">
                    {sparepartsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleBackClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-[#F5F6FA] px-6 lg:px-8 py-6 flex justify-between items-center mt-12 lg:mt-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.id === activeView)?.label || 'Dashboard'}
          </h2>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            AD
          </div>
        </header>

        <div className="flex-1 px-6 lg:px-8 pb-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};
