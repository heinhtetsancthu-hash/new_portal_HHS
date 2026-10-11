import React, { useState, useEffect, useMemo } from 'react';
import { 
  PiggyBank, Sparkles, ShoppingBag, Layers, Eye, X, TrendingDown,
  Minus, Plus, Edit2, Trash2, Search, Calendar, FileText, Check, AlertTriangle, Filter, RotateCcw
} from 'lucide-react';
import { SavingRecord, Transaction, DailyRecordItem } from '../types';
import { 
  subscribeStoredSavingRecords,
  saveStoredSavingRecords,
  subscribeToTransactions,
  subscribeToDailyRecords
} from '../db';

// Date utility helpers
const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getLocalDateString = (timestampOrStr: number | string | undefined): string => {
  if (!timestampOrStr) return '';
  if (typeof timestampOrStr === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(timestampOrStr)) {
      return timestampOrStr;
    }
    const d = new Date(timestampOrStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  if (typeof timestampOrStr === 'number') {
    const d = new Date(timestampOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

type DateFilterMode = 'all' | 'today' | 'month' | 'range';

const matchesDateFilter = (
  dateVal: number | string | undefined,
  mode: DateFilterMode,
  selectedMonth: string,
  startDate: string,
  endDate: string
): boolean => {
  if (mode === 'all') return true;

  const recDateStr = getLocalDateString(dateVal);
  if (!recDateStr) return false;

  if (mode === 'today') {
    return recDateStr === getTodayString();
  }

  if (mode === 'month') {
    const targetMonth = selectedMonth || getCurrentMonthString();
    return recDateStr.startsWith(targetMonth);
  }

  if (mode === 'range') {
    if (startDate && endDate) {
      return recDateStr >= startDate && recDateStr <= endDate;
    }
    if (startDate) {
      return recDateStr >= startDate;
    }
    if (endDate) {
      return recDateStr <= endDate;
    }
    return true;
  }

  return true;
};

export const FinanceSaving: React.FC = () => {
  const [records, setRecords] = useState<SavingRecord[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<Transaction[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecordItem[]>([]);
  
  // Modals
  const [showAccessoriesModal, setShowAccessoriesModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SavingRecord | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<SavingRecord | null>(null);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterMode>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Draft filter state inside the modal
  const [tempDateFilter, setTempDateFilter] = useState<DateFilterMode>('all');
  const [tempSelectedMonth, setTempSelectedMonth] = useState<string>(getCurrentMonthString());
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');

  // Withdraw Form State
  const [withdrawCategory, setWithdrawCategory] = useState<'စုငွေ' | 'Accessories'>('စုငွေ');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');
  const [withdrawDate, setWithdrawDate] = useState<string>(getTodayString());
  const [formError, setFormError] = useState<string>('');

  // Transactions Filter & Search
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'စုငွေ' | 'Accessories'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscriptions
  useEffect(() => {
    const unsubRecords = subscribeStoredSavingRecords((data) => {
      setRecords(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Real-time subscribe to finance transactions
    const unsubTx = subscribeToTransactions((txs) => {
      setFinanceTransactions(txs);
    });

    // Subscribe to daily records for accessories
    const unsubDaily = subscribeToDailyRecords((items) => {
      setDailyRecords(items);
    });

    return () => {
      unsubRecords();
      unsubTx();
      unsubDaily();
    };
  }, []);

  // Filtered collections by Date
  const filteredRecords = useMemo(() => {
    return records.filter((r) =>
      matchesDateFilter(r.date || r.createdAt, dateFilter, selectedMonth, startDate, endDate)
    );
  }, [records, dateFilter, selectedMonth, startDate, endDate]);

  const filteredFinanceTransactions = useMemo(() => {
    return financeTransactions.filter((t) =>
      matchesDateFilter(t.createdAt, dateFilter, selectedMonth, startDate, endDate)
    );
  }, [financeTransactions, dateFilter, selectedMonth, startDate, endDate]);

  const filteredDailyRecords = useMemo(() => {
    return dailyRecords.filter((r) =>
      matchesDateFilter(r.date || r.createdAt, dateFilter, selectedMonth, startDate, endDate)
    );
  }, [dailyRecords, dateFilter, selectedMonth, startDate, endDate]);

  // Summary Metrics from filtered records
  const { totalDeposits, depositCount } = useMemo(() => {
    let dep = 0;
    let dCount = 0;
    filteredRecords.forEach((r) => {
      if (r.type === 'deposit') {
        dep += r.amount;
        dCount++;
      }
    });

    return {
      totalDeposits: dep,
      depositCount: dCount,
    };
  }, [filteredRecords]);

  // Withdrawals breakdown
  const { 
    withdrawRecords,
    saungNgweWithdrawTxs,
    saungNgweWithdrawTotal,
    accWithdrawTxs,
    accWithdrawTotal
  } = useMemo(() => {
    const wTxs = filteredRecords.filter((r) => r.type === 'withdraw');
    
    // စုငွေ withdrawals: category === 'စုငွေ' or any withdrawal not categorized as 'Accessories'
    const sTxs = wTxs.filter((r) => r.category === 'စုငွေ' || (!r.category && r.category !== 'Accessories'));
    const sTotal = sTxs.reduce((sum, r) => sum + r.amount, 0);

    // Accessories withdrawals: category === 'Accessories'
    const aTxs = wTxs.filter((r) => r.category === 'Accessories');
    const aTotal = aTxs.reduce((sum, r) => sum + r.amount, 0);

    return {
      withdrawRecords: wTxs,
      saungNgweWithdrawTxs: sTxs,
      saungNgweWithdrawTotal: sTotal,
      accWithdrawTxs: aTxs,
      accWithdrawTotal: aTotal,
    };
  }, [filteredRecords]);

  // Total Amount of "စုငွေ" (Preserved Savings / Deposits)
  // Combines:
  // 1) Saving Deposits from this Vault/Saving module
  // 2) Expense records categorized as "စုငွေ" from Finance Overview
  // Reduced by: Total withdrawal amount of "စုငွေ"
  const { 
    grossSaungNgwe, 
    netSaungNgwe, 
    saungNgweExpenseTotal, 
    saungNgweExpenseCount 
  } = useMemo(() => {
    const expenseTxs = filteredFinanceTransactions.filter(
      (t) => t.type === 'expense' && (t.category === 'စုငွေ' || t.category.toLowerCase().includes('စုငွေ'))
    );
    const expTotal = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const gross = totalDeposits + expTotal;
    const net = gross - saungNgweWithdrawTotal;

    return {
      grossSaungNgwe: gross,
      netSaungNgwe: net,
      saungNgweExpenseTotal: expTotal,
      saungNgweExpenseCount: expenseTxs.length,
    };
  }, [totalDeposits, filteredFinanceTransactions, saungNgweWithdrawTotal]);

  // Total Amount of "Accessories" & Expense Accessories Amount
  // Combines:
  // 1) Expense Accessories from Finance: type === 'expense' with category/desc "Accessories" or "Accessories Company"
  // 2) Expense Accessories from Daily Records: category 'Daily Expense' with name containing "Accessories"
  // Reduced by: Total withdrawal amount of "Accessories"
  const { 
    financeExpenseAccTotal,
    financeExpenseAccCount,
    dailyExpenseAccTotal,
    dailyExpenseAccCount,
    totalExpenseAccessories,
    netExpenseAccessories,
    allExpenseAccRecords
  } = useMemo(() => {
    // 1) From Daily Records (Expenses mentioning accessories)
    const dailyAccExpItems = filteredDailyRecords.filter(
      (r) => (r.category === 'Daily Expense' || r.category.toLowerCase().includes('expense')) &&
             (r.name || '').toLowerCase().includes('accessories')
    );
    const dailyExpTotal = dailyAccExpItems.reduce(
      (sum, r) => sum + (r.cashAmount || 0) + (r.bankingAmount || 0),
      0
    );

    // 2) From Finance Transactions (Expenses)
    const isAccTx = (t: Transaction) => {
      const cat = (t.category || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return cat.includes('accessories') || desc.includes('accessories');
    };

    const financeAccExpenses = filteredFinanceTransactions.filter((t) => t.type === 'expense' && isAccTx(t));
    const finExpense = financeAccExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = finExpense + dailyExpTotal;
    const netExpense = totalExpense - accWithdrawTotal;

    return {
      financeExpenseAccTotal: finExpense,
      financeExpenseAccCount: financeAccExpenses.length,
      dailyExpenseAccTotal: dailyExpTotal,
      dailyExpenseAccCount: dailyAccExpItems.length,
      totalExpenseAccessories: totalExpense,
      netExpenseAccessories: netExpense,
      allExpenseAccRecords: [
        ...financeAccExpenses.map((t) => ({
          id: t.id,
          date: new Date(t.createdAt).toLocaleDateString(),
          category: t.category,
          source: 'Finance Expense',
          description: t.description || 'Accessory Expense',
          amount: t.amount,
        })),
        ...dailyAccExpItems.map((r) => ({
          id: r.id,
          date: r.date,
          category: 'Daily Expense',
          source: 'Daily Record',
          description: r.name || 'Daily Accessory Expense',
          amount: (r.cashAmount || 0) + (r.bankingAmount || 0),
        })),
      ],
    };
  }, [filteredDailyRecords, filteredFinanceTransactions, accWithdrawTotal]);

  // Open Filter Modal
  const handleOpenFilterModal = () => {
    setTempDateFilter(dateFilter);
    setTempSelectedMonth(selectedMonth || getCurrentMonthString());
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowFilterModal(true);
  };

  // Apply Filter from Modal
  const handleApplyFilter = () => {
    setDateFilter(tempDateFilter);
    setSelectedMonth(tempSelectedMonth);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowFilterModal(false);
  };

  // Clear Filter
  const handleClearFilter = () => {
    setDateFilter('all');
    setTempDateFilter('all');
    setStartDate('');
    setEndDate('');
    setTempStartDate('');
    setTempEndDate('');
    setShowFilterModal(false);
  };

  // Handle open add withdraw modal
  const handleOpenWithdrawModal = () => {
    setEditingRecord(null);
    setWithdrawCategory('စုငွေ');
    setWithdrawAmount('');
    setWithdrawNote('');
    setWithdrawDate(getTodayString());
    setFormError('');
    setShowWithdrawModal(true);
  };

  // Handle open edit withdraw modal
  const handleOpenEditModal = (record: SavingRecord) => {
    setEditingRecord(record);
    setWithdrawCategory((record.category === 'Accessories' ? 'Accessories' : 'စုငွေ') as 'စုငွေ' | 'Accessories');
    setWithdrawAmount(record.amount.toString());
    setWithdrawNote(record.note || '');
    setWithdrawDate(record.date || getLocalDateString(record.createdAt) || getTodayString());
    setFormError('');
    setShowWithdrawModal(true);
  };

  // Save / Update withdrawal
  const handleSaveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      if (editingRecord) {
        // Update existing record
        const updatedRecords = records.map((r) => {
          if (r.id === editingRecord.id) {
            return {
              ...r,
              amount: parsedAmount,
              category: withdrawCategory,
              note: withdrawNote.trim(),
              date: withdrawDate,
            };
          }
          return r;
        });
        await saveStoredSavingRecords(updatedRecords);
      } else {
        // Add new withdraw record
        const newRecord: SavingRecord = {
          id: `withdraw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'withdraw',
          category: withdrawCategory,
          amount: parsedAmount,
          note: withdrawNote.trim(),
          date: withdrawDate,
          createdAt: Date.now(),
        };
        await saveStoredSavingRecords([newRecord, ...records]);
      }
      setShowWithdrawModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to save withdrawal', err);
      setFormError('Failed to save withdrawal. Please try again.');
    }
  };

  // Confirm delete withdrawal
  const handleDeleteWithdrawal = async () => {
    if (!deleteConfirmRecord) return;
    try {
      const filtered = records.filter((r) => r.id !== deleteConfirmRecord.id);
      await saveStoredSavingRecords(filtered);
      setDeleteConfirmRecord(null);
    } catch (err) {
      console.error('Failed to delete withdrawal', err);
    }
  };

  // Filtered transactions for list display (Category & Search on top of Date filter)
  const filteredWithdrawTransactions = useMemo(() => {
    return withdrawRecords.filter((tx) => {
      // Category filter
      if (categoryFilter === 'စုငွေ') {
        if (tx.category !== 'စုငွေ' && tx.category) return false;
      } else if (categoryFilter === 'Accessories') {
        if (tx.category !== 'Accessories') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNote = (tx.note || '').toLowerCase().includes(query);
        const matchesCategory = (tx.category || '').toLowerCase().includes(query);
        const matchesDate = (tx.date || '').toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        if (!matchesNote && !matchesCategory && !matchesDate && !matchesAmount) return false;
      }

      return true;
    });
  }, [withdrawRecords, categoryFilter, searchQuery]);

  return (
    <div className="pb-16">
      {/* Sticky Top Header */}
      <header className="bg-white px-6 lg:px-8 py-5 border-b border-slate-200 sticky top-0 z-10 shadow-sm pt-16 lg:pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <PiggyBank size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Savings &amp; Reserve Vault</h1>
                <p className="text-xs text-slate-500 font-medium">Manage preserved savings, accessory amounts &amp; withdrawals</p>
              </div>
            </div>
          </div>

          {/* Header Action: Filter Button Beside of Withdraw Button */}
          <div className="flex items-center gap-2.5">
            {/* Filter Button */}
            <button
              onClick={handleOpenFilterModal}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                dateFilter !== 'all'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Filter records by date"
            >
              <Filter size={15} className={dateFilter !== 'all' ? 'text-emerald-600' : 'text-slate-500'} />
              <span>
                {dateFilter === 'all' && 'Filter'}
                {dateFilter === 'today' && 'Today'}
                {dateFilter === 'month' && 'Month'}
                {dateFilter === 'range' && 'Date Range'}
              </span>
              {dateFilter !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Withdraw Button */}
            <button
              onClick={handleOpenWithdrawModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Minus size={16} className="stroke-[2.5]" />
              <span>Withdraw Money</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Active Filter Indicator Banner */}
        {dateFilter !== 'all' && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-emerald-900">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Calendar size={15} />
              </span>
              <div>
                <span className="font-bold">Active Filter: </span>
                {dateFilter === 'today' && (
                  <span>Today &bull; <span className="font-semibold">{getTodayString()}</span></span>
                )}
                {dateFilter === 'month' && (
                  <span>Month &bull; <span className="font-semibold">{selectedMonth || getCurrentMonthString()}</span></span>
                )}
                {dateFilter === 'range' && (
                  <span>Date Range &bull; <span className="font-semibold">{startDate || 'Start'}</span> to <span className="font-semibold">{endDate || 'End'}</span></span>
                )}
                <span className="text-[11px] text-emerald-700/80 block sm:inline sm:ml-2">
                  (Showing filtered amounts and transactions)
                </span>
              </div>
            </div>
            <button
              onClick={handleClearFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-300 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
            >
              <RotateCcw size={13} />
              <span>Reset to All Time</span>
            </button>
          </div>
        )}

        {/* User Requested Highlights: Total Amount of "စုငွေ" and Total Amount of Expense "Accessories" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Highlight Card 1: Net Balance of စုငွေ */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 rounded-2xl text-white shadow-md shadow-emerald-900/15 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 text-white/10 pointer-events-none">
              <PiggyBank size={140} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl">
                    <PiggyBank size={20} className="text-emerald-100" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                      Preserved Savings
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      Net Balance of &ldquo; စုငွေ &rdquo;
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-500/30 border border-emerald-300/30 px-2.5 py-1 rounded-full text-emerald-100 backdrop-blur-sm">
                  {depositCount + saungNgweExpenseCount} entries
                </span>
              </div>

              <div className="my-2">
                <span className="text-[11px] text-emerald-200/90 uppercase font-semibold tracking-wider block">
                  Net Available Amount
                </span>
                <div className="text-3xl lg:text-4xl font-black tracking-tight text-white mt-0.5">
                  {netSaungNgwe.toLocaleString()}{' '}
                  <span className="text-base font-bold opacity-80">MMK</span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1.5 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-300" />
                  Gross: {grossSaungNgwe.toLocaleString()} MMK &bull; Withdrawn: -{saungNgweWithdrawTotal.toLocaleString()} MMK
                </p>
              </div>
            </div>

            {/* Breakdown Sub-strip */}
            <div className="mt-4 pt-3 border-t border-emerald-500/30 grid grid-cols-2 gap-2 text-xs">
              {/* 1) Net Balance of စုငွေ */}
              <div className="bg-black/15 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                <span className="text-emerald-200 block text-[10px] uppercase font-bold">
                  Net Balance of &ldquo; စုငွေ &rdquo;
                </span>
                <span className="font-bold text-white text-sm block mt-0.5">
                  {netSaungNgwe.toLocaleString()} MMK
                </span>
              </div>
              {/* 2) Total Withdraw Amount */}
              <div className="bg-black/15 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                <span className="text-emerald-200 block text-[10px] uppercase font-bold">
                  Total Withdraw Amount
                </span>
                <span className="font-bold text-rose-300 text-sm block mt-0.5">
                  -{saungNgweWithdrawTotal.toLocaleString()} MMK
                </span>
                <span className="text-[10px] text-emerald-100/70 block mt-0.5">
                  {saungNgweWithdrawTxs.length} withdrawal records
                </span>
              </div>
            </div>
          </div>

          {/* Highlight Card 2: Total Amount of Expense Accessories (Reduced by Withdrawals) */}
          <div className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md shadow-indigo-900/15 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 text-white/10 pointer-events-none">
              <ShoppingBag size={140} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl">
                    <ShoppingBag size={20} className="text-rose-200" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                      Accessories Sales &amp; Turnover
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      Expense &ldquo; Accessories &rdquo; Amount
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold bg-rose-500/30 border border-rose-300/30 px-2.5 py-1 rounded-full text-rose-100 backdrop-blur-sm">
                    {allExpenseAccRecords.length} expense records
                  </span>
                  <button
                    onClick={() => setShowAccessoriesModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
                    title="View Expense Records"
                  >
                    <Eye size={12} />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              <div className="my-2">
                <span className="text-[11px] text-rose-200/90 uppercase font-semibold tracking-wider block">
                  Net Expense Accessories Amount
                </span>
                <div className="text-3xl lg:text-4xl font-black tracking-tight text-white flex items-baseline gap-2 mt-0.5">
                  <span>{netExpenseAccessories.toLocaleString()}</span>
                  <span className="text-base font-bold opacity-80">MMK</span>
                </div>
                <p className="text-xs text-indigo-100/90 mt-1.5 font-medium flex items-center gap-1.5">
                  <Layers size={13} className="text-rose-300" />
                  Gross Expense: {totalExpenseAccessories.toLocaleString()} MMK &bull; Withdrawn: -{accWithdrawTotal.toLocaleString()} MMK
                </p>
              </div>
            </div>

            {/* Breakdown Sub-strip - Expense Accessories & Withdraw */}
            <div className="mt-4 pt-3 border-t border-indigo-500/30 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/5">
                <span className="text-indigo-200/80 block text-[10px] uppercase font-semibold">Gross Expense Acc</span>
                <span className="font-bold text-rose-300 text-sm">{totalExpenseAccessories.toLocaleString()} MMK</span>
                <span className="text-[10px] text-indigo-200/60 block mt-0.5">Fin: {financeExpenseAccTotal.toLocaleString()} | Daily: {dailyExpenseAccTotal.toLocaleString()}</span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/5">
                <span className="text-indigo-200/80 block text-[10px] uppercase font-semibold">Total Withdraw Acc</span>
                <span className="font-bold text-rose-300 text-sm">-{accWithdrawTotal.toLocaleString()} MMK</span>
                <span className="text-[10px] text-indigo-200/60 block mt-0.5">{accWithdrawTxs.length} withdrawal records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Transactions Section (User can edit, Delete) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Withdraw Transactions</h2>
                <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {withdrawRecords.length} records
                </span>
                {dateFilter !== 'all' && (
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                    Filtered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                History of withdrawals reducing စုငွေ and Accessories balances
              </p>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter Pills */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All ({withdrawRecords.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('စုငွေ')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    categoryFilter === 'စုငွေ'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  စုငွေ ({saungNgweWithdrawTxs.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('Accessories')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    categoryFilter === 'Accessories'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Accessories ({accWithdrawTxs.length})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search note or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-44 sm:w-56"
                />
              </div>

              {/* New Withdraw Button */}
              <button
                onClick={handleOpenWithdrawModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {filteredWithdrawTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No withdrawal records found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== 'ALL' || dateFilter !== 'all'
                  ? 'No transactions match the selected filters. Try clearing or adjusting date/category filters.'
                  : 'Start by clicking the "Withdraw Money" button to record your first withdrawal.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {dateFilter !== 'all' && (
                  <button
                    onClick={handleClearFilter}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Date Filter</span>
                  </button>
                )}
                <button
                  onClick={handleOpenWithdrawModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                  <span>Add Withdrawal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Withdraw Category</th>
                    <th className="py-3 px-4">Note / Description</th>
                    <th className="py-3 px-4 text-right">Withdrawn Amount</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWithdrawTransactions.map((tx) => {
                    const isAcc = tx.category === 'Accessories';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{tx.date || new Date(tx.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isAcc ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <ShoppingBag size={12} />
                              <span>Accessories</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <PiggyBank size={12} />
                              <span>စုငွေ</span>
                            </span>
                          )}
                        </td>

                        {/* Note */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {tx.note ? (
                            <span>{tx.note}</span>
                          ) : (
                            <span className="text-slate-400 italic">No note provided</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-black text-rose-600 text-sm">
                            -{tx.amount.toLocaleString()} MMK
                          </span>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Transaction"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmRecord(tx)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Date Filter Modal (Popup Filter Form: Today / Month / Date Range) */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Filter size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Filter by Date</h3>
                  <p className="text-xs text-slate-500">Filter data by Today, Month, or Date Range</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-4 my-5">
              {/* Filter Type Cards */}
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Today */}
                <button
                  type="button"
                  onClick={() => setTempDateFilter('today')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    tempDateFilter === 'today'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <Calendar size={18} className={tempDateFilter === 'today' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs">Today</span>
                </button>

                {/* 2. Month */}
                <button
                  type="button"
                  onClick={() => setTempDateFilter('month')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    tempDateFilter === 'month'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <Calendar size={18} className={tempDateFilter === 'month' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs">Month</span>
                </button>

                {/* 3. Date Range */}
                <button
                  type="button"
                  onClick={() => setTempDateFilter('range')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    tempDateFilter === 'range'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                  }`}
                >
                  <Calendar size={18} className={tempDateFilter === 'range' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs">Date Range</span>
                </button>
              </div>

              {/* Dynamic Inputs based on selected filter */}
              {tempDateFilter === 'today' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span>Selected Date:</span>
                  <span className="font-bold text-slate-800">{getTodayString()}</span>
                </div>
              )}

              {tempDateFilter === 'month' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={tempSelectedMonth}
                    onChange={(e) => setTempSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    All records from {tempSelectedMonth || getCurrentMonthString()} will be shown.
                  </span>
                </div>
              )}

              {tempDateFilter === 'range' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      From Date (Start)
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      To Date (End)
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>All Time (Reset)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilter}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Apply Filter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal (Popup Withdraw Form / Edit Form) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Minus size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingRecord ? 'Edit Withdrawal' : 'Withdraw Money'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingRecord ? 'Update withdrawal details' : 'Amount will reduce from selected category'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveWithdrawal} className="space-y-4 mt-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Withdraw Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWithdrawCategory('စုငွေ')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      withdrawCategory === 'စုငွေ'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        <PiggyBank size={16} className={withdrawCategory === 'စုငွေ' ? 'text-emerald-600' : 'text-slate-400'} />
                        စုငွေ
                      </span>
                      {withdrawCategory === 'စုငွေ' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5">
                      Net Balance: {netSaungNgwe.toLocaleString()} MMK
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawCategory('Accessories')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      withdrawCategory === 'Accessories'
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        <ShoppingBag size={16} className={withdrawCategory === 'Accessories' ? 'text-indigo-600' : 'text-slate-400'} />
                        Accessories
                      </span>
                      {withdrawCategory === 'Accessories' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5">
                      Net Amount: {netExpenseAccessories.toLocaleString()} MMK
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount ( MMK ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount (e.g. 100000)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full pl-3 pr-14 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    MMK
                  </span>
                </div>
                {withdrawAmount && !isNaN(parseFloat(withdrawAmount)) && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Formatted: <span className="font-bold text-rose-600">{parseFloat(withdrawAmount).toLocaleString()} MMK</span>
                  </p>
                )}
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="Optional note for withdrawal"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={withdrawDate}
                  onChange={(e) => setWithdrawDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingRecord ? 'Save Changes' : 'Save Withdrawal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Delete Withdrawal?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this withdrawal of{' '}
              <span className="font-bold text-slate-700">{deleteConfirmRecord.amount.toLocaleString()} MMK</span> ({deleteConfirmRecord.category || 'စုငွေ'})?
              This will restore the balance to {deleteConfirmRecord.category || 'စုငွေ'}.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWithdrawal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessories Breakdown & Expense Details Modal */}
      {showAccessoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Expense Accessories Breakdown</h3>
                  <p className="text-xs text-slate-500">Itemized expense records and withdrawals for Accessories</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccessoriesModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Net Expense Accessories</span>
                <span className="text-lg font-black text-rose-600">{netExpenseAccessories.toLocaleString()} MMK</span>
                <span className="text-[10px] text-rose-400 block mt-0.5">Reduced by {accWithdrawTotal.toLocaleString()} MMK</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Expenses</span>
                <span className="text-base font-bold text-slate-700">{totalExpenseAccessories.toLocaleString()} MMK</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{allExpenseAccRecords.length} records</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Withdrawn</span>
                <span className="text-base font-bold text-rose-600">-{accWithdrawTotal.toLocaleString()} MMK</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{accWithdrawTxs.length} withdrawals</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown size={14} /> Expense Accessories Records ({allExpenseAccRecords.length})
                  </h4>
                  <span className="text-xs font-bold text-rose-600">Total: {totalExpenseAccessories.toLocaleString()} MMK</span>
                </div>
                {allExpenseAccRecords.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-200">
                    No expense records found matching &ldquo;Accessories&rdquo; category or description.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                    {allExpenseAccRecords.map((item) => (
                      <div key={item.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                        <div>
                          <div className="font-semibold text-slate-800">{item.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.date} &bull; <span className="bg-rose-50 text-rose-700 font-medium px-1.5 py-0.5 rounded">{item.category}</span> ({item.source})
                          </div>
                        </div>
                        <div className="font-black text-rose-600 text-sm">-{item.amount.toLocaleString()} MMK</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAccessoriesModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
