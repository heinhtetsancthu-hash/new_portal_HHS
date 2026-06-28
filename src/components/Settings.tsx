import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Save } from 'lucide-react';
import { getSettings, saveSettings, subscribeToSettings } from '../db';

export const DEFAULT_ERROR_TYPES = [
  "No Power",
  "USB Port",
  "FRP",
  "Global Change",
  "Battery Replace",
  "Battery Error",
  "Glass Replacement",
  "Apple ID",
  "Speaker Error",
  "Earpiece Error",
  "Power Key",
  "Screen Lock Remove",
  "playstore",
  "Mic Error",
  "Glue",
  "Computer Repair",
  "Backglass Replace"
];

export const getStoredErrorTypes = async (): Promise<string[]> => {
  try {
    const stored = await getSettings('repair_error_types_v2');
    if (stored) return stored;
  } catch (e) {
    console.error('Failed to get error types', e);
  }
  return DEFAULT_ERROR_TYPES;
};

export const subscribeStoredErrorTypes = (callback: (types: string[]) => void): (() => void) => {
  return subscribeToSettings('repair_error_types_v2', (stored) => {
    if (stored) {
      callback(stored);
    } else {
      callback(DEFAULT_ERROR_TYPES);
    }
  });
};

export const setStoredErrorTypes = async (types: string[]) => {
  try {
    await saveSettings('repair_error_types_v2', types);
  } catch (e) {
    console.error('Failed to save error types', e);
  }
};

export const getStoredTerms = async (): Promise<string> => {
  try {
    const stored = await getSettings('repair_terms_condition');
    if (stored) return stored;
  } catch (e) {
    console.error('Failed to get terms', e);
  }
  return "1. We are not responsible for any data loss during the repair. Please backup your data.\n2. Devices left over 60 days after repair completion will be disposed of.\n3. Water damage repairs carry no warranty.";
};

export const subscribeStoredTerms = (callback: (terms: string) => void): (() => void) => {
  return subscribeToSettings('repair_terms_condition', (stored) => {
    if (stored) {
      callback(stored);
    } else {
      callback("1. We are not responsible for any data loss during the repair. Please backup your data.\n2. Devices left over 60 days after repair completion will be disposed of.\n3. Water damage repairs carry no warranty.");
    }
  });
};

export const setStoredTerms = async (terms: string) => {
  try {
    await saveSettings('repair_terms_condition', terms);
  } catch (e) {
    console.error('Failed to save terms', e);
  }
};

export const getStoredSaleTerms = async (): Promise<string> => {
  try {
    const stored = await getSettings('sale_terms_condition');
    if (stored) return stored;
  } catch (e) {
    console.error('Failed to get sale terms', e);
  }
  return "ဝယ်ယူအားပေးမှု့ကို ကျေဇူးအထူးတင်ရှိပါသည်။\nဝယ်ပြီးပစ္စည်း ပြန်မလဲပေးပါ ။";
};

export const subscribeStoredSaleTerms = (callback: (terms: string) => void): (() => void) => {
  return subscribeToSettings('sale_terms_condition', (stored) => {
    if (stored) {
      callback(stored);
    } else {
      callback("ဝယ်ယူအားပေးမှု့ကို ကျေဇူးအထူးတင်ရှိပါသည်။\nဝယ်ပြီးပစ္စည်း ပြန်မလဲပေးပါ ။");
    }
  });
};

export const setStoredSaleTerms = async (terms: string) => {
  try {
    await saveSettings('sale_terms_condition', terms);
  } catch (e) {
    console.error('Failed to save sale terms', e);
  }
};

export const DEFAULT_SPAREPART_CATEGORIES = [
  'Battery',
  'Glass',
  'Speaker',
  'Middle Flex',
  'Display',
  'Camera',
  'Charging Port',
  'Other'
];

export const getStoredSparepartCategories = async (): Promise<string[]> => {
  try {
    const stored = await getSettings('sparepart_categories');
    if (stored) return stored;
  } catch (e) {
    console.error('Failed to get sparepart categories', e);
  }
  return DEFAULT_SPAREPART_CATEGORIES;
};

export const subscribeStoredSparepartCategories = (callback: (types: string[]) => void): (() => void) => {
  return subscribeToSettings('sparepart_categories', (stored) => {
    if (stored) {
      callback(stored);
    } else {
      callback(DEFAULT_SPAREPART_CATEGORIES);
    }
  });
};

export const setStoredSparepartCategories = async (types: string[]) => {
  try {
    await saveSettings('sparepart_categories', types);
  } catch (e) {
    console.error('Failed to save sparepart categories', e);
  }
};

export const Settings: React.FC = () => {
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [sparepartCategories, setSparepartCategories] = useState<string[]>([]);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editCategoryText, setEditCategoryText] = useState('');

  const [terms, setTerms] = useState('');
  const [termsSaved, setTermsSaved] = useState(false);
  const [saleTerms, setSaleTerms] = useState('');
  const [saleTermsSaved, setSaleTermsSaved] = useState(false);

  useEffect(() => {
    const unsubErrors = subscribeStoredErrorTypes(setErrorTypes);
    const unsubTerms = subscribeStoredTerms(setTerms);
    const unsubSaleTerms = subscribeStoredSaleTerms(setSaleTerms);
    const unsubCategories = subscribeStoredSparepartCategories(setSparepartCategories);
    return () => {
      unsubErrors();
      unsubTerms();
      unsubSaleTerms();
      unsubCategories();
    };
  }, []);

  const handleAdd = () => {
    if (newItemText.trim()) {
      const updated = [...errorTypes, newItemText.trim()];
      setErrorTypes(updated);
      setStoredErrorTypes(updated);
      setNewItemText('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryText.trim()) {
      const updated = [...sparepartCategories, newCategoryText.trim()];
      setSparepartCategories(updated);
      setStoredSparepartCategories(updated);
      setNewCategoryText('');
    }
  };

  const handleDelete = (index: number) => {
    const updated = errorTypes.filter((_, i) => i !== index);
    setErrorTypes(updated);
    setStoredErrorTypes(updated);
  };

  const handleDeleteCategory = (index: number) => {
    const updated = sparepartCategories.filter((_, i) => i !== index);
    setSparepartCategories(updated);
    setStoredSparepartCategories(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(errorTypes[index]);
  };

  const handleStartEditCategory = (index: number) => {
    setEditingCategoryIndex(index);
    setEditCategoryText(sparepartCategories[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editText.trim()) {
      const updated = [...errorTypes];
      updated[index] = editText.trim();
      setErrorTypes(updated);
      setStoredErrorTypes(updated);
    }
    setEditingIndex(null);
    setEditText('');
  };

  const handleSaveEditCategory = (index: number) => {
    if (editCategoryText.trim()) {
      const updated = [...sparepartCategories];
      updated[index] = editCategoryText.trim();
      setSparepartCategories(updated);
      setStoredSparepartCategories(updated);
    }
    setEditingCategoryIndex(null);
    setEditCategoryText('');
  };

  const handleSaveTerms = () => {
    setStoredTerms(terms);
    setTermsSaved(true);
    setTimeout(() => setTermsSaved(false), 3000);
  };
  
  const handleSaveSaleTerms = () => {
    setStoredSaleTerms(saleTerms);
    setSaleTermsSaved(true);
    setTimeout(() => setSaleTermsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Error Types Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Error Types Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">Manage the error types available in the new ticket form.</p>
          </div>
          <button
            onClick={() => {
              setErrorTypes(DEFAULT_ERROR_TYPES);
              setStoredErrorTypes(DEFAULT_ERROR_TYPES);
            }}
            className="text-sm px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Reset to Defaults
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add new error type..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleAdd}
              disabled={!newItemText.trim()}
              className="bg-[#5C67ED] hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {errorTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-[#F9FAFB] shadow-sm">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                      className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEdit(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
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
            {errorTypes.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No error types configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sparepart Category Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Sparepart Categories Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">Manage the categories available for sparepart stock.</p>
          </div>
          <button
            onClick={() => {
              setSparepartCategories(DEFAULT_SPAREPART_CATEGORIES);
              setStoredSparepartCategories(DEFAULT_SPAREPART_CATEGORIES);
            }}
            className="text-sm px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Reset to Defaults
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategoryText}
              onChange={(e) => setNewCategoryText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Add new category..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryText.trim()}
              className="bg-[#5C67ED] hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {sparepartCategories.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-[#F9FAFB] shadow-sm">
                {editingCategoryIndex === index ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editCategoryText}
                      onChange={(e) => setEditCategoryText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditCategory(index)}
                      className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEditCategory(index)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingCategoryIndex(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEditCategory(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCategory(index)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {sparepartCategories.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No categories configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Terms & Conditions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F8F9FA]">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Repair Terms and Conditions</h3>
            <p className="text-sm text-slate-500 mt-1">Configure your local repair shop terms.</p>
          </div>
          <button
            onClick={handleSaveTerms}
            className="bg-[#5C67ED] hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <Save size={16} />
            {termsSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={6}
            placeholder="Enter repair policies, warranties, or terms..."
            className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
          />
          {termsSaved && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg flex items-center gap-2 border border-emerald-100">
              <Check size={16} /> Terms successfully saved to local settings.
            </div>
          )}
        </div>
      </div>

      {/* Sale Terms & Conditions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F8F9FA]">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Sale Terms and Conditions</h3>
            <p className="text-sm text-slate-500 mt-1">Configure your sale receipt terms.</p>
          </div>
          <button
            onClick={handleSaveSaleTerms}
            className="bg-[#5C67ED] hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <Save size={16} />
            {saleTermsSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={saleTerms}
            onChange={(e) => setSaleTerms(e.target.value)}
            rows={6}
            placeholder="Enter sale policies, warranties, or terms..."
            className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-y"
          />
          {saleTermsSaved && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg flex items-center gap-2 border border-emerald-100">
              <Check size={16} /> Sale terms successfully saved to local settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
