import re

with open("src/components/TemperGlass.tsx", "r") as f:
    code = f.read()

new_code = """import React, { useState } from 'react';
import { ArrowLeft, Menu, Search } from 'lucide-react';

interface TemperGlassProps {
  onBack: () => void;
}

export const TemperGlass: React.FC<TemperGlassProps> = ({ onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const navItems = ['DASHBOARD', 'ADD NEW', 'CUSTOMER ORDER', 'BRANDS'];

  const dummyData = [
    { brand: 'Redmi', name: '10C/PocoM40/A3/12c' },
    { brand: 'Redmi', name: '10x4g/note9' },
    { brand: 'Redmi', name: '12/12R/note12r/13/13R/pocom6pro' },
    { brand: 'Redmi', name: '15C/PocoC85' },
    { brand: 'iPhone', name: '17promax/turbo4/4pro/turbo5max' },
    { brand: 'Redmi', name: '9A/spark8C/10A/9C/honorX6' },
    { brand: 'Oppo', name: 'A16K/A54s/A16/A564G/Realmec25/C25s' },
    { brand: 'Oppo', name: 'A17/A17K/RealmeC35/A18/A38/A57/A77/A77s/A78/A57s/A59' },
    { brand: 'Oppo', name: 'A1k/RealmeC2' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-gray-300">
      <header className="bg-[#111] border-b border-[#333] sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-[#dcb755] hover:bg-[#1a1a1a] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-[#dcb755] hover:bg-[#1a1a1a] transition-colors"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-serif text-[#dcb755] tracking-wider uppercase ml-2">Temper Glass</h1>
            </div>
            <div>
              <button className="text-xs text-gray-500 tracking-widest uppercase hover:text-white transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-[#0a0a0a] border-r border-[#333] flex flex-col hidden md:flex">
            <nav className="p-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
                    activeTab === item
                      ? 'border border-[#dcb755] text-[#dcb755]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'DASHBOARD' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif text-[#dcb755] uppercase tracking-widest">Inventory</h2>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search by Brand or Brand Name..."
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-[#dcb755] transition-colors placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="border border-[#333] bg-[#111] rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-[#dcb755] border-b border-[#333]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Brand</th>
                      <th className="px-6 py-4 font-semibold">Brand Name</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyData.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{row.brand}</td>
                        <td className="px-6 py-4 text-gray-300">{row.name}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors">
                            EDIT
                          </button>
                          <button className="bg-white text-black px-3 py-1 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors">
                            DEL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== 'DASHBOARD' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{activeTab} module is under construction.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
"""

with open("src/components/TemperGlass.tsx", "w") as f:
    f.write(new_code)
