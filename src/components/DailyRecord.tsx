import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Edit2, X, Search, Filter } from 'lucide-react';
import { saveDailyRecord, subscribeToDailyRecords, deleteDailyRecord, updateDailyRecord } from '../db';
import { DailyRecordItem } from '../types';

interface DailyRecordProps {
  onBack: () => void;
}

export const DailyRecord: React.FC<DailyRecordProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'newEntry' | 'records' | 'overview'>('newEntry');
  const [overviewDate, setOverviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dashboardDate, setDashboardDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'delete', id: string } | { type: 'edit', record: DailyRecordItem } | null>(null);

  const [isCash, setIsCash] = useState(true);
  const [isBanking, setIsBanking] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('AA');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cashAmount, setCashAmount] = useState('');
  const [bankingAmount, setBankingAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<DailyRecordItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToDailyRecords((items) => {
      setRecords(items);
    });
    return () => unsubscribe();
  }, []);

  
  const handlePasswordSubmit = () => {
    if (passwordInput === '1471656') {
      setWrongPassword(false);
      setShowPasswordPrompt(false);
      setPasswordInput('');
      if (pendingAction?.type === 'delete') {
        executeDelete(pendingAction.id);
      } else if (pendingAction?.type === 'edit') {
        executeEdit(pendingAction.record);
      }
      setPendingAction(null);
    } else {
      setWrongPassword(true);
    }
  };

  const requestDelete = (id: string) => {
    setPendingAction({ type: 'delete', id });
    setShowPasswordPrompt(true);
  };

  const requestEdit = (record: DailyRecordItem) => {
    setPendingAction({ type: 'edit', record });
    setShowPasswordPrompt(true);
  };

  const executeDelete = async (id: string) => {
    await deleteDailyRecord(id);
    alert('Record deleted');
  };

  const executeEdit = (record: DailyRecordItem) => {
    setEditingId(record.id);
    setName(record.name);
    setCategory(record.category);
    setDate(record.date);
    setIsCash(record.isCash);
    setIsBanking(record.isBanking);
    setCashAmount(record.cashAmount > 0 ? record.cashAmount.toString() : '');
    setBankingAmount(record.bankingAmount > 0 ? record.bankingAmount.toString() : '');
    setActiveTab('newEntry');
  };

  const handleSave = async () => {
    console.log("Save clicked", { name, category, date, isCash, isBanking, cashAmount, bankingAmount });
    if (!name) {
      alert('Please enter customer name or reference.');
      return;
    }
    if (!isCash && !isBanking) {
      alert('Please select at least one payment method.');
      return;
    }

    const itemData = {
      name,
      category,
      date,
      isCash,
      isBanking,
      cashAmount: isCash ? parseFloat(cashAmount) || 0 : 0,
      bankingAmount: isBanking ? parseFloat(bankingAmount) || 0 : 0,
    };

    try {
      if (editingId) {
        const updatedItem: DailyRecordItem = {
          id: editingId,
          ...itemData,
          createdAt: records.find(r => r.id === editingId)?.createdAt || Date.now()
        };
        await updateDailyRecord(updatedItem);
        alert('Record Updated');
        setEditingId(null);
      } else {
        const newItem: DailyRecordItem = {
          id: Date.now().toString(),
          ...itemData,
          createdAt: Date.now()
        };
        await saveDailyRecord(newItem);
        alert('Record Saved');
      }
      setName('');
      setCashAmount('');
      setBankingAmount('');
      setActiveTab('records');
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving record: " + String(error));
    }
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const dashRecords = records.filter(r => r.date === dashboardDate);
        
        const getDashCategoryStats = (cat: string) => {
          const catRecords = dashRecords.filter(r => r.category === cat);
          const cash = catRecords.reduce((sum, r) => sum + r.cashAmount, 0);
          const banking = catRecords.reduce((sum, r) => sum + r.bankingAmount, 0);
          return { cash, banking, total: cash + banking };
        };

        const dAA = getDashCategoryStats('AA');
        const dBB = getDashCategoryStats('BB');
        const dAcc = getDashCategoryStats('Accessories');
        const dExp = getDashCategoryStats('Daily Expense');
        const dMagyi = getDashCategoryStats('MaGyi');

        const totalCashIncome = dAA.cash + dBB.cash + dAcc.cash;
        const totalCashExpense = dExp.cash;
        const totalCash = totalCashIncome - totalCashExpense;
        const totalBanking = dAA.banking + dBB.banking + dAcc.banking;

        return (
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Daily Closing</h2>
              <div className="flex items-center">
                <input 
                  type="date" 
                  value={dashboardDate}
                  onChange={(e) => setDashboardDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-gray-300 text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-center">
              {/* AA */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">AA</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dAA.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dAA.banking || ''}</div>
                </div>
              </div>

              {/* BB */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">BB</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dBB.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dBB.banking || ''}</div>
                </div>
              </div>

              {/* Daily Accessories */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-green-500 font-bold mb-6 text-base tracking-wider">Daily Accessories</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dAcc.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dAcc.banking || ''}</div>
                </div>
              </div>

              {/* Daily Expense */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-red-500 font-bold mb-6 text-base tracking-wider">Daily Expense</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dExp.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dExp.banking || ''}</div>
                </div>
              </div>

              {/* Ma Gyi */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-blue-500 font-bold mb-6 text-base tracking-wider">Ma Gyi</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-gray-400">{dMagyi.cash || ''}</div>
                  <div className="flex-1 text-gray-400">{dMagyi.banking || ''}</div>
                </div>
              </div>

              {/* Total */}
              <div className="border border-[#0ea5e9] bg-[#0a0a0a] rounded py-6 px-2 flex flex-col justify-between">
                <div className="text-blue-500 font-bold mb-6 text-base tracking-wider">Total</div>
                <div className="flex font-bold mb-6">
                  <div className="flex-1 text-white">Cash</div>
                  <div className="flex-1 text-white">Banking</div>
                </div>
                <div className="flex font-bold">
                  <div className="flex-1 text-blue-500">{totalCash || 0}</div>
                  <div className="flex-1 text-blue-500">{totalBanking || 0}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'newEntry':
        return (
          <div className="max-w-2xl mx-auto border border-[#333] bg-[#111] p-8 mt-8">
            <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
              <h2 className="text-2xl font-serif text-[#dcb755]">{editingId ? "Edit Entry" : "New Entry"}</h2>
              <span className="text-xs text-gray-500 tracking-wider">07 JUL 2026</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Customer / Reference / Item</label>
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#dcb755] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors appearance-none cursor-pointer"
                >
                  <option value="AA">AA</option>
                  <option value="BB">BB</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Daily Expense">Daily Expense</option>
                  <option value="MaGyi">MaGyi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsCash(!isCash)}
                      className={`flex items-center justify-center gap-2 py-3 border rounded text-xs tracking-wider transition-colors ${
                        isCash 
                          ? 'border-[#dcb755] text-white' 
                          : 'border-[#333] text-gray-500 bg-[#1a1a1a]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isCash ? 'bg-[#dcb755]' : 'border border-gray-600'}`}></div>
                      CASH
                    </button>
                    <button
                      onClick={() => setIsBanking(!isBanking)}
                      className={`flex items-center justify-center gap-2 py-3 border rounded text-xs tracking-wider transition-colors ${
                        isBanking 
                          ? 'border-[#dcb755] text-white' 
                          : 'border-[#333] text-gray-500 bg-[#1a1a1a]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isBanking ? 'bg-[#dcb755]' : 'border border-gray-600'}`}></div>
                      BANKING
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {isCash && (
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Cash Amount (MMK)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />
                  </div>
                )}
                {isBanking && (
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest mb-2 uppercase">Banking Amount (MMK)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={bankingAmount}
                      onChange={e => setBankingAmount(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-3 text-gray-400 focus:outline-none focus:border-[#dcb755] transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  className="w-full bg-[#dcb755] hover:bg-[#c8a141] text-black font-bold tracking-widest py-4 rounded text-sm transition-colors"
                >
                  {editingId ? 'UPDATE RECORD' : 'SAVE RECORD'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'records':
        const filteredRecords = records.filter(r => {
          const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCategory = filterCategory === 'All' || r.category === filterCategory;
          const matchDate = !filterDate || r.date === filterDate;
          return matchSearch && matchCategory && matchDate;
        });

        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-6 text-gray-300">
            <h2 className="text-xl font-serif text-[#dcb755] mb-6">Records</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search by name/ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#333] rounded pl-10 pr-8 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] appearance-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="AA">AA</option>
                    <option value="BB">BB</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Daily Expense">Daily Expense</option>
                    <option value="MaGyi">MaGyi</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No records found for the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-widest text-[#dcb755] border-b border-[#333]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Name/Ref</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Cash (MMK)</th>
                      <th className="px-4 py-3">Banking (MMK)</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-3">{record.date}</td>
                        <td className="px-4 py-3 text-white font-medium">{record.name}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#222] text-gray-300 px-2 py-1 rounded text-xs">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">{record.isCash ? record.cashAmount.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3">{record.isBanking ? record.bankingAmount.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => requestEdit(record)}
                            className="text-gray-500 hover:text-[#dcb755] transition-colors p-2"
                            title="Edit record"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => requestDelete(record.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2"
                            title="Delete record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        );
      case 'overview':
        const overviewRecords = records.filter(r => r.date === overviewDate);
        const getCategoryTotal = (cat: string) => {
          const catRecords = overviewRecords.filter(r => r.category === cat);
          const cash = catRecords.reduce((sum, r) => sum + r.cashAmount, 0);
          const banking = catRecords.reduce((sum, r) => sum + r.bankingAmount, 0);
          return { cash, banking, total: cash + banking, records: catRecords };
        };

        const aaStats = getCategoryTotal('AA');
        const bbStats = getCategoryTotal('BB');
        const accStats = getCategoryTotal('Accessories');
        const expStats = getCategoryTotal('Daily Expense');
        const magyiStats = getCategoryTotal('MaGyi');

        const incomeCashTotal = aaStats.cash + bbStats.cash + accStats.cash;
        const incomeBankingTotal = aaStats.banking + bbStats.banking + accStats.banking;
        const closingAmount = (aaStats.total + bbStats.total + accStats.total) - expStats.total;

        return (
          <div className="bg-[#111] rounded-xl border border-[#333] p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
              <h2 className="text-sm font-bold text-[#dcb755] tracking-widest uppercase">Daily Overview Sheet</h2>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">SELECT DATE:</span>
                <input 
                  type="date" 
                  value={overviewDate}
                  onChange={(e) => setOverviewDate(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#dcb755] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="border border-[#333] bg-[#0a0a0a]">
              {/* Top 5 columns row */}
              <div className="grid grid-cols-5 border-b border-[#333]">
                {/* Col 1: AA */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{aaStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{aaStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{aaStats.total || ''}</span></div>
                </div>
                {/* Col 2: BB */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{bbStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{bbStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{bbStats.total || ''}</span></div>
                </div>
                {/* Col 3: Accessories */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{accStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{accStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{accStats.total || ''}</span></div>
                </div>
                {/* Col 4: Daily Expense */}
                <div className="p-4 border-r border-[#333]">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-red-500">Cash</span><span className="text-white">{expStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-red-500">Banking</span><span className="text-white">{expStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-red-500">Total Amount</span><span className="text-[#dcb755]">{expStats.total || ''}</span></div>
                </div>
                {/* Col 5: MaGyi */}
                <div className="p-4">
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Cash</span><span className="text-white">{magyiStats.cash || ''}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className="text-gray-400">Banking</span><span className="text-white">{magyiStats.banking || ''}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Amount</span><span className="text-[#dcb755]">{magyiStats.total || ''}</span></div>
                </div>
              </div>

              {/* Cash Total Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Cash Total (AA +BB +Accessories)</span>
                <span className="text-white text-sm">{incomeCashTotal || ''}</span>
              </div>

              {/* Banking Total Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Banking Total (AA +BB +Accessories )</span>
                <span className="text-white text-sm">{incomeBankingTotal || ''}</span>
              </div>

              {/* Closing Amount Row */}
              <div className="border-b border-[#333] p-4 flex items-center">
                <span className="text-gray-400 text-sm w-[40%]">Closing Amount ( AA + BB + Accessories ) - Daily Expense</span>
                <span className="text-[#dcb755] font-bold text-sm">{closingAmount || ''}</span>
              </div>

              {/* Header Row for Items */}
              <div className="grid grid-cols-5 border-b border-[#333] text-center text-sm py-4">
                <div className="border-r border-[#333] text-green-500">AA</div>
                <div className="border-r border-[#333] text-green-500">BB</div>
                <div className="border-r border-[#333] text-green-500">Accessories</div>
                <div className="border-r border-[#333] text-red-500">Daily Expense</div>
                <div className="text-blue-500">MaGyi</div>
              </div>

              {/* Items Rows */}
              <div className="flex text-sm">
                {[aaStats, bbStats, accStats, expStats, magyiStats].map((stat, idx) => (
                  <div key={idx} className={`flex-1 ${idx < 4 ? 'border-r border-[#333]' : ''} p-4 min-h-[300px]`}>
                    {stat.records.map(r => (
                      <div key={r.id} className="flex justify-between mb-3 items-center">
                        <span className="text-gray-400 text-xs truncate pr-2" title={r.name}>{r.name}</span>
                        <span className="text-white text-xs whitespace-nowrap">{r.cashAmount + r.bankingAmount}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">
      <header className="bg-[#111] border-b border-[#333] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col h-auto pt-4 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-serif text-[#dcb755] tracking-widest leading-none mb-1">DAILYRECORD</h1>
                <span className="text-[10px] tracking-[0.2em] text-gray-500">HHS MANAGEMENT SYSTEM</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8 h-12">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('newEntry')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'newEntry' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                New Entry
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'records' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Records
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs tracking-widest uppercase h-full px-1 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#dcb755] text-[#dcb755]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Overview
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {renderTabContent()}
      </main>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-w-sm w-full relative">
            <button 
              onClick={() => { setShowPasswordPrompt(false); setPendingAction(null); setPasswordInput(''); setWrongPassword(false); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif text-[#dcb755] mb-4">Master Password</h3>
            <p className="text-gray-500 text-sm mb-4">Please enter the master password to perform this action.</p>
            <div className="mb-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setWrongPassword(false);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                className={`w-full bg-[#1a1a1a] border ${wrongPassword ? 'border-red-500' : 'border-[#333]'} rounded px-4 py-3 text-white focus:outline-none focus:border-[#dcb755] transition-colors`}
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            {wrongPassword && <p className="text-red-500 text-xs font-semibold mb-4 text-left">Incorrect password.</p>}
            {!wrongPassword && <div className="mb-4"></div>}
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowPasswordPrompt(false); setPendingAction(null); setPasswordInput(''); setWrongPassword(false); }}
                className="flex-1 bg-transparent border border-[#333] hover:border-gray-500 text-gray-300 font-medium py-2 px-4 rounded transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handlePasswordSubmit}
                className="flex-1 bg-[#dcb755] hover:bg-[#c8a141] text-black font-medium py-2 px-4 rounded transition-colors"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
