import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Save } from 'lucide-react';

export const DEFAULT_ERROR_TYPES = [
  "Broken Screen",
  "Battery Replacement",
  "Charging Port Issue",
  "Water Damage",
  "Software Issue",
  "Other"
];

export const getStoredErrorTypes = (): string[] => {
  const stored = localStorage.getItem('repair_error_types');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_ERROR_TYPES;
    }
  }
  return DEFAULT_ERROR_TYPES;
};

export const setStoredErrorTypes = (types: string[]) => {
  localStorage.setItem('repair_error_types', JSON.stringify(types));
};

export const getStoredTerms = (): string => {
  return localStorage.getItem('repair_terms_condition') || "1. We are not responsible for any data loss during the repair. Please backup your data.\n2. Devices left over 60 days after repair completion will be disposed of.\n3. Water damage repairs carry no warranty.";
};

export const setStoredTerms = (terms: string) => {
  localStorage.setItem('repair_terms_condition', terms);
};

export const Settings: React.FC = () => {
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [terms, setTerms] = useState('');
  const [termsSaved, setTermsSaved] = useState(false);

  useEffect(() => {
    setErrorTypes(getStoredErrorTypes());
    setTerms(getStoredTerms());
  }, []);

  const handleAdd = () => {
    if (newItemText.trim()) {
      const updated = [...errorTypes, newItemText.trim()];
      setErrorTypes(updated);
      setStoredErrorTypes(updated);
      setNewItemText('');
    }
  };

  const handleDelete = (index: number) => {
    const updated = errorTypes.filter((_, i) => i !== index);
    setErrorTypes(updated);
    setStoredErrorTypes(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(errorTypes[index]);
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

  const handleSaveTerms = () => {
    setStoredTerms(terms);
    setTermsSaved(true);
    setTimeout(() => setTermsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Error Types Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Error Types Configuration</h3>
          <p className="text-sm text-slate-500 mt-1">Manage the error types available in the new ticket form.</p>
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

      {/* Terms & Conditions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F8F9FA]">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Terms and Conditions</h3>
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
    </div>
  );
};
