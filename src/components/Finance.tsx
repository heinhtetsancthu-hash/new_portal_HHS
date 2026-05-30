import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Trash2, Calendar, Settings, LogOut, Menu, X, Check, Edit2, Upload, Download, Filter, Search, Eye } from 'lucide-react';
import { saveTransaction, getTransactions, deleteTransaction, updateTransaction } from '../db';
import { Transaction } from '../types';

interface FinanceProps {
  onBack: () => void;
}

const DEFAULT_INCOME_CATS = ['Repair Service', 'Accessory Sales', 'Device Sales', 'Other'];
const DEFAULT_EXPENSE_CATS = ['Spare Parts', 'Shop Rent', 'Utilities', 'Salary', 'Other'];

export const getStoredIncomeCats = (): string[] => {
  const stored = localStorage.getItem('finance_income_cats');
  return stored ? JSON.parse(stored) : DEFAULT_INCOME_CATS;
};
export const setStoredIncomeCats = (cats: string[]) => {
  localStorage.setItem('finance_income_cats', JSON.stringify(cats));
};
export const getStoredExpenseCats = (): string[] => {
  const stored = localStorage.getItem('finance_expense_cats');
  return stored ? JSON.parse(stored) : DEFAULT_EXPENSE_CATS;
};
export const setStoredExpenseCats = (cats: string[]) => {
  localStorage.setItem('finance_expense_cats', JSON.stringify(cats));
};

export const Finance: React.FC<FinanceProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<'overview' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOutClick = async () => {
    try {
      const txs = await getTransactions();
      const backupData = JSON.stringify(txs, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HeinHtetSan+Finance+${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Auto backup failed', e);
    }
    onBack();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-sm text-slate-600 border border-slate-200"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-white w-64 border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-emerald-500" />
            Finance
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOutClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full min-h-screen overflow-x-hidden">
        {activeView === 'overview' && <FinanceOverview />}
        {activeView === 'settings' && <FinanceSettings />}
      </main>
    </div>
  );
};

// Helper for date calculations
const isToday = (ts: number) => new Date(ts).toDateString() === new Date().toDateString();
const isYesterday = (ts: number) => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return new Date(ts).toDateString() === y.toDateString();
};
const isInRange = (ts: number, start: string, end: string) => {
  if (!start && !end) return true;
  const tTime = new Date(ts).setHours(0,0,0,0);
  
  if (start && end) {
    const sTime = new Date(start).setHours(0,0,0,0);
    const eTime = new Date(end).setHours(0,0,0,0);
    return tTime >= sTime && tTime <= eTime;
  }
  if (start) {
    const sTime = new Date(start).setHours(0,0,0,0);
    return tTime >= sTime;
  }
  if (end) {
    const eTime = new Date(end).setHours(0,0,0,0);
    return tTime <= eTime;
  }
  return true;
};

const FinanceOverview = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [incomeCats, setIncomeCats] = useState<string[]>([]);
  const [expenseCats, setExpenseCats] = useState<string[]>([]);

  // Filters
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'range'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadTransactions = async () => {
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => b.createdAt - a.createdAt));
  };


  useEffect(() => {
    loadTransactions();
    setIncomeCats(getStoredIncomeCats());
    setExpenseCats(getStoredExpenseCats());
  }, [showForm]);

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setDescription(tx.description || '');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTx(null);
    setAmount('');
    setCategory('');
    setDescription('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    if (editingTx) {
      await updateTransaction({
        ...editingTx,
        type,
        amount: parseFloat(amount),
        category,
        description,
      });
      setEditingTx(null);
    } else {
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type,
        amount: parseFloat(amount),
        category,
        description,
        createdAt: Date.now()
      };
      await saveTransaction(tx);
    }
    
    setShowForm(false);
    setAmount('');
    setCategory('');
    setDescription('');
    loadTransactions();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      await deleteTransaction(deleteConfirmId);
      loadTransactions();
      setDeleteConfirmId(null);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    let dateMatch = true;
    if (dateFilter === 'today') dateMatch = isToday(t.createdAt);
    if (dateFilter === 'yesterday') dateMatch = isYesterday(t.createdAt);
    if (dateFilter === 'range') dateMatch = isInRange(t.createdAt, startDate, endDate);
    
    let searchMatch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      searchMatch = 
        t.category.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        t.amount.toString().includes(term) ||
        t.type.toLowerCase().includes(term);
    }
    
    let categoryMatch = true;
    if (categoryFilter) {
      categoryMatch = t.category === categoryFilter;
    }
    
    return dateMatch && searchMatch && categoryMatch;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <>
      <header className="bg-white px-6 lg:px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm pt-16 lg:pt-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage income, expenses, and financial tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg font-medium flex items-center gap-2 border transition-colors text-sm ${showFilters ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors text-sm"
          >
            {showForm ? 'Cancel' : <><Plus size={16} /> Add Record</>}
          </button>
        </div>
      </header>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {showFilters && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search descriptions, amounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                  >
                    <option value="">All Categories</option>
                    <optgroup label="Income">
                      {incomeCats.map(c => <option key={`inc-${c}`} value={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Expense">
                      {expenseCats.map(c => <option key={`exp-${c}`} value={c}>{c}</option>)}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full items-center">
              <button 
                onClick={() => setDateFilter('all')} 
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${dateFilter === 'all' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >All</button>
              <button 
                onClick={() => setDateFilter('today')} 
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${dateFilter === 'today' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >Today</button>
              <button 
                onClick={() => setDateFilter('yesterday')} 
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${dateFilter === 'yesterday' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >Yesterday</button>
              <button 
                onClick={() => setDateFilter('range')} 
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${dateFilter === 'range' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >Range</button>
              
              {dateFilter === 'range' && (
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-800">{totalIncome.toLocaleString()} <span className="text-lg text-slate-400">MMK</span></h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Expenses</p>
              <h3 className="text-3xl font-bold text-slate-800">{totalExpense.toLocaleString()} <span className="text-lg text-slate-400">MMK</span></h3>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-slate-500 mb-1">Net Profit</p>
              <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{netProfit.toLocaleString()} <span className="text-lg opacity-70">MMK</span></h3>
           </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl mx-auto relative">
            <button onClick={cancelForm} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-4">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-4">
                 <button type="button" onClick={() => { setType('income'); setCategory(''); }} className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 border-2 transition-all ${type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <ArrowDownRight size={18} /> Income
                 </button>
                 <button type="button" onClick={() => { setType('expense'); setCategory(''); }} className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 border-2 transition-all ${type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <ArrowUpRight size={18} /> Expense
                 </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (MMK) *</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="" disabled>Select category</option>
                  {(type === 'income' ? incomeCats : expenseCats).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Additional details..." />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors">
                {editingTx ? 'Update Record' : 'Save Record'}
              </button>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
             <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
           </div>
           
           {filteredTransactions.length === 0 ? (
             <div className="text-center p-12 text-slate-400">
               <DollarSign size={48} className="mx-auto text-slate-200 mb-3" />
               <p className="font-medium">No transactions found</p>
               <p className="text-sm">Adjust your filters or add a new record.</p>
             </div>
           ) : (
             <div className="divide-y divide-slate-100">
               {filteredTransactions.map(tx => (
                 <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                       {tx.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                     </div>
                     <div>
                       <p className="font-bold text-slate-800">{tx.category}</p>
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                         <Calendar size={12} />
                         <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                         {tx.description && <span className="hidden sm:inline before:content-['•'] before:mx-1 before:text-slate-300">{tx.description}</span>}
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 sm:gap-4">
                     <span className={`font-bold mr-2 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                       {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} MMK
                     </span>
                     <button onClick={() => setViewingTx(tx)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View details">
                       <Eye size={16} />
                     </button>
                     <button onClick={() => handleEdit(tx)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Edit">
                       <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {viewingTx && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Eye size={18} className="text-slate-500" />
                Transaction Details
              </h2>
              <button onClick={() => setViewingTx(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{viewingTx.type === 'income' ? 'Income' : 'Expense'}</p>
                <div className={`text-4xl font-bold flex items-center justify-center gap-2 ${viewingTx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {viewingTx.type === 'income' ? '+' : '-'}{viewingTx.amount.toLocaleString()} <span className="text-lg opacity-70">MMK</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-slate-800 font-medium">{viewingTx.category}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-slate-800 font-medium">{new Date(viewingTx.createdAt).toLocaleString()}</p>
                </div>
                
                {viewingTx.description && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description / Note</p>
                    <p className="text-slate-800 font-medium">{viewingTx.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => { setViewingTx(null); handleEdit(viewingTx); }}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                onClick={() => { setViewingTx(null); handleDelete(viewingTx.id); }}
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Transaction?</h3>
            <p className="text-slate-500 mb-6 text-sm">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FinanceSettings = () => {
  return (
    <>
      <header className="bg-white px-6 lg:px-8 py-5 border-b border-slate-200 sticky top-0 z-10 shadow-sm pt-16 lg:pt-5">
        <h1 className="text-xl font-bold text-slate-800">Settings & Data Backup</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Configure categories and backup transactions</p>
      </header>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <CategorySettings title="Income Categories" type="income" />
        <CategorySettings title="Expense Categories" type="expense" />
        <FinanceBackup />
      </div>
    </>
  );
};

const CategorySettings = ({ title, type }: { title: string, type: 'income' | 'expense' }) => {
  const [cats, setCats] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setCats(type === 'income' ? getStoredIncomeCats() : getStoredExpenseCats());
  }, [type]);

  const saveToStorage = (newCats: string[]) => {
    if (type === 'income') setStoredIncomeCats(newCats);
    else setStoredExpenseCats(newCats);
  };

  const handleAdd = () => {
    if (newItem.trim() && !cats.includes(newItem.trim())) {
      const newCats = [...cats, newItem.trim()];
      setCats(newCats);
      saveToStorage(newCats);
      setNewItem('');
    }
  };

  const handleDelete = (index: number) => {
    const newCats = cats.filter((_, i) => i !== index);
    setCats(newCats);
    saveToStorage(newCats);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(cats[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editText.trim() && !cats.includes(editText.trim())) {
      const newCats = [...cats];
      newCats[index] = editText.trim();
      setCats(newCats);
      saveToStorage(newCats);
    }
    setEditingIndex(null);
    setEditText('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new category..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {cats.map((cat, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-[#F9FAFB] shadow-sm">
              {editingIndex === index ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                    className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(index)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">{cat}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStartEdit(index)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(index)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {cats.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">No categories configured.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FinanceBackup = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{message: string, type: 'success' | 'error' | 'confirm', data?: Transaction[]} | null>(null);

  const handleBackup = async () => {
    try {
      const txs = await getTransactions();
      const backupData = JSON.stringify(txs, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HeinHtetSan+Finance+${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const txs: Transaction[] = JSON.parse(event.target?.result as string);
        if (!Array.isArray(txs)) throw new Error('Invalid format');
        setRestoreStatus({ message: 'Are you sure you want to restore data from this file?', type: 'confirm', data: txs });
      } catch (err) {
        setRestoreStatus({ message: 'Invalid backup file. Please select a valid JSON backup.', type: 'error' });
        console.error(err);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const executeRestore = async () => {
    if (restoreStatus?.data) {
      for (const tx of restoreStatus.data) {
        if (tx.id && tx.type && tx.amount) {
          await saveTransaction(tx);
        }
      }
      setRestoreStatus({ message: 'Finance backup restored successfully!', type: 'success' });
      setTimeout(() => setRestoreStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">Data Backup & Restore</h3>
        <p className="text-sm text-slate-500 mt-1">Export your transaction data as JSON or import an existing backup.</p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-xl p-5 flex flex-col items-start gap-4 bg-[#F9FAFB]">
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Download size={18} className="text-slate-400" />
              Backup Data
            </h4>
            <p className="text-xs text-slate-500 mt-1">Download all your records to your device.</p>
          </div>
          <button
            onClick={handleBackup}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            Download Backup
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl p-5 flex flex-col items-start gap-4 bg-[#F9FAFB]">
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Upload size={18} className="text-slate-400" />
              Restore Data
            </h4>
            <p className="text-xs text-slate-500 mt-1">Import a previously saved backup file.</p>
          </div>
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleRestore}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            Select Backup File
          </button>
        </div>
      </div>
      
      {restoreStatus && (
        <div className={`m-6 mt-2 p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
          restoreStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          restoreStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-indigo-50 text-indigo-700 border border-indigo-200'
        }`}>
          <span>{restoreStatus.message}</span>
          
          <div className="flex items-center gap-2">
            {restoreStatus.type === 'confirm' && (
              <button onClick={executeRestore} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm">
                Confirm
              </button>
            )}
            <button onClick={() => setRestoreStatus(null)} className="p-1 opacity-70 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
