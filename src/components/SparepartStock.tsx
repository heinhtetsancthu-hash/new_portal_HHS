import React, { useState, useEffect, useRef } from 'react';
import { Archive, PlusCircle, List, Check, Trash2, Search, Edit, AlertCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SparepartStockItem } from '../types';
import { saveSparepartStockItem, deleteSparepartStockItem, subscribeToSparepartStockItems } from '../db';
import { subscribeStoredSparepartCategories } from './Settings';

export const SparepartStock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('list');
  const [items, setItems] = useState<SparepartStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Form State
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [count, setCount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<SparepartStockItem | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<string>('All');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const unsubItems = subscribeToSparepartStockItems((fetchedItems) => {
      setItems(fetchedItems);
      setLoading(false);
    });
    
    const unsubCategories = subscribeStoredSparepartCategories((fetchedCategories) => {
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0 && !category) {
        setCategory(fetchedCategories[0]);
      }
    });

    return () => {
      unsubItems();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    // Keep category valid if categories change and current category is not in the list
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !name || count === '' || isNaN(Number(count))) return;

    setIsSubmitting(true);
    
    const newItem: SparepartStockItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      model,
      name,
      category,
      count: Number(count),
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
    };

    try {
      await saveSparepartStockItem(newItem);
      handleCancelEdit();
      setActiveTab('list');
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: SparepartStockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setModel(item.model);
    setName(item.name);
    setCategory(item.category);
    setCount(item.count);
    setActiveTab('new');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setModel('');
    setName('');
    setCategory(categories.length > 0 ? categories[0] : '');
    setCount('');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (deletePassword !== '1471656') {
      setDeleteError('Incorrect password');
      return;
    }
    if (!deletingId) return;

    await deleteSparepartStockItem(deletingId);
    setDeletingId(null);
    setDeletePassword('');
  };

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    const headers = ['Model', 'Sparepart Name', 'Category', 'Stock Left'];
    const rows = filteredItems.map(item => [
      `"${item.model.replace(/"/g, '""')}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      item.count
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SparepartStock.csv`;
    link.click();
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = `Sparepart Stock - ${searchCategory === 'All' ? 'All Categories' : searchCategory}`;
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    
    const tableData = filteredItems.map(item => [
      item.model,
      item.name,
      item.category,
      item.count.toString()
    ]);
    
    autoTable(doc, {
      head: [['Model', 'Sparepart Name', 'Category', 'Stock Left']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo 600
    });
    
    doc.save(`SparepartStock.pdf`);
    setIsExportMenuOpen(false);
  };

  const filteredItems = items
    .filter(item => 
      (searchCategory === 'All' || item.category === searchCategory) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.count - b.count);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col font-sans mb-8">
      <div className="p-6 border-b border-slate-100 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Archive size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sparepart Stock</h2>
            <p className="text-sm text-slate-500">Manage your spareparts inventory</p>
          </div>
        </div>
        
        {activeTab === 'list' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors appearance-none"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search spareparts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  <button 
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    Export CSV
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText size={16} className="text-red-500" />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alert for items with 0 stock */}
      {items.some(item => item.count === 0) && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Out of Stock Alert</h4>
            <p className="text-sm mt-1">
              The following models and parts are out of stock:
              <br />
              <span className="font-medium">
                {items.filter(i => i.count === 0).map(i => `${i.model} - ${i.name}`).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex px-6 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'list'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <List size={16} /> Browse Stock
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'new'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <PlusCircle size={16} /> Add Sparepart
        </button>
      </div>

      <div className="p-6 flex-1 bg-slate-50 rounded-b-2xl">
        {activeTab === 'new' && (
          <div className="max-w-xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingItem ? 'Edit Sparepart Stock' : 'Add Sparepart to Stock'}
              </h3>
              {editingItem && (
                <button type="button" onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  placeholder="e.g. iPhone 13 Pro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sparepart Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  placeholder="e.g. Original Battery"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors appearance-none"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Count</label>
                  <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={e => setCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                    placeholder="e.g. 5"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting || !model || !name || count === ''}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
                >
                  <Check size={18} />
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Sparepart Info' : 'Save Sparepart to Stock'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading stock...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm mx-auto max-w-lg">
                <Archive size={48} className="mx-auto text-slate-200 mb-4" />
                <h4 className="text-slate-700 font-semibold text-lg">No spareparts in stock</h4>
                <p className="text-slate-500 mt-1">Add your first item to start tracking inventory</p>
                <button 
                  onClick={() => setActiveTab('new')}
                  className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
                >
                  <PlusCircle size={18} /> Add Sparepart
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
               <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                  No parts found {searchQuery || searchCategory !== 'All' ? 'matching the selected filters.' : '.'}
               </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                        <th className="p-4 whitespace-nowrap">Model</th>
                        <th className="p-4 whitespace-nowrap">Sparepart Name</th>
                        <th className="p-4 whitespace-nowrap">Category</th>
                        <th className="p-4 whitespace-nowrap">Count</th>
                        <th className="p-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-800">{item.model}</td>
                          <td className="p-4 text-slate-600">{item.name}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full text-xs font-medium border border-slate-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {item.count <= 2 ? (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Low Stock"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              )}
                              <span className={`font-semibold ${item.count === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                                {item.count}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={(e) => handleEdit(item, e)}
                                className="text-slate-400 hover:text-indigo-500 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(item.id, e)}
                                className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-500 text-sm mb-5">Please enter the master password to confirm deletion.</p>
            
            <div className="mb-5">
              <input
                type="password"
                placeholder="Enter password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${deleteError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white transition-shadow`}
                autoFocus
              />
              {deleteError && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
