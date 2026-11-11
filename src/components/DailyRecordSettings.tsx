import React, { useState, useEffect } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, X, Check, RotateCcw, 
  Tag, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { 
  DEFAULT_DAILY_RECORD_CATEGORIES, 
  subscribeStoredDailyRecordCategories, 
  setStoredDailyRecordCategories 
} from '../db';

interface DailyRecordSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChange?: (cats: string[]) => void;
}

export const DailyRecordSettings: React.FC<DailyRecordSettingsProps> = ({
  isOpen,
  onClose,
  onCategoriesChange
}) => {
  const [categories, setCategories] = useState<string[]>(DEFAULT_DAILY_RECORD_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<string | null>(null);

  // Subscribe to real-time changes in Firestore
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeStoredDailyRecordCategories((cats) => {
      setCategories(cats);
      if (onCategoriesChange) {
        onCategoriesChange(cats);
      }
    });
    return () => unsubscribe();
  }, [isOpen, onCategoriesChange]);

  if (!isOpen) return null;

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    const trimmed = newCatName.trim();
    if (!trimmed) {
      showFeedback('Please enter a category name.', true);
      return;
    }

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showFeedback(`Category "${trimmed}" already exists.`, true);
      return;
    }

    const updated = [...categories, trimmed];
    try {
      await setStoredDailyRecordCategories(updated);
      setCategories(updated);
      setNewCatName('');
      showFeedback(`Category "${trimmed}" added successfully!`);
    } catch (err) {
      console.error('Failed to add category:', err);
      showFeedback('Error saving category to Firestore.', true);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(categories[index]);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
    setError('');
  };

  const handleSaveEdit = async (index: number) => {
    setError('');
    const trimmed = editText.trim();
    if (!trimmed) {
      showFeedback('Category name cannot be empty.', true);
      return;
    }

    // Check if new name already exists in another index
    const existsOther = categories.some(
      (c, idx) => idx !== index && c.toLowerCase() === trimmed.toLowerCase()
    );
    if (existsOther) {
      showFeedback(`Category "${trimmed}" already exists.`, true);
      return;
    }

    const updated = [...categories];
    const oldName = updated[index];
    updated[index] = trimmed;

    try {
      await setStoredDailyRecordCategories(updated);
      setCategories(updated);
      setEditingIndex(null);
      setEditText('');
      showFeedback(`Category "${oldName}" updated to "${trimmed}"!`);
    } catch (err) {
      console.error('Failed to update category:', err);
      showFeedback('Error updating category in Firestore.', true);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (categories.length <= 1) {
      showFeedback('You must have at least one category.', true);
      setDeleteConfirmCat(null);
      return;
    }

    const updated = categories.filter((c) => c !== catToDelete);
    try {
      await setStoredDailyRecordCategories(updated);
      setCategories(updated);
      setDeleteConfirmCat(null);
      showFeedback(`Category "${catToDelete}" deleted.`);
    } catch (err) {
      console.error('Failed to delete category:', err);
      showFeedback('Error deleting category from Firestore.', true);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await setStoredDailyRecordCategories(DEFAULT_DAILY_RECORD_CATEGORIES);
      setCategories(DEFAULT_DAILY_RECORD_CATEGORIES);
      showFeedback('Reset to default categories.');
    } catch (err) {
      console.error('Failed to reset categories:', err);
      showFeedback('Error resetting categories in Firestore.', true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111] border border-[#333] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a1a1a] border border-[#dcb755]/40 text-[#dcb755] rounded-xl">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#dcb755] tracking-wide">
                Daily Record Settings
              </h3>
              <p className="text-xs text-gray-400">
                Manage Daily Record categories synchronized with Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mt-5 space-y-2">
          <label className="block text-[10px] font-bold text-[#dcb755] tracking-widest uppercase">
            Add New Category
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setError('');
                }}
                placeholder="Enter category name (e.g. CC, Services...)"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#dcb755] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-5 py-2.5 bg-[#dcb755] hover:bg-[#c8a141] disabled:opacity-50 text-black font-bold text-xs tracking-wider uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Existing Categories ({categories.length})
            </span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] text-gray-400 hover:text-[#dcb755] flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset to default category set"
            >
              <RotateCcw size={12} />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="divide-y divide-[#222] border border-[#333] bg-[#0d0d0d] rounded-xl overflow-hidden">
            {categories.map((cat, index) => {
              const isEditing = editingIndex === index;

              return (
                <div
                  key={`${cat}-${index}`}
                  className="p-3 flex items-center justify-between hover:bg-[#141414] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(index);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        className="w-full bg-[#1a1a1a] border border-[#dcb755] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(index)}
                        className="p-1.5 bg-[#dcb755] hover:bg-[#c8a141] text-black rounded-lg transition-colors cursor-pointer"
                        title="Save Changes"
                      >
                        <Check size={14} className="stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#dcb755]"></span>
                        <span className="text-sm font-medium text-white">{cat}</span>
                        {cat === 'CC' && (
                          <span className="text-[10px] bg-[#dcb755]/15 border border-[#dcb755]/30 text-[#dcb755] px-1.5 py-0.5 rounded font-bold">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index)}
                          className="p-2 text-gray-400 hover:text-[#dcb755] hover:bg-[#222] rounded-lg transition-colors cursor-pointer"
                          title="Edit Category Name"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmCat(cat)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#222] rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirmCat && (
          <div className="mt-4 p-4 bg-[#1a1a1a] border border-red-900/60 rounded-xl text-xs space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertCircle size={16} />
              <span>Confirm Delete Category</span>
            </div>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmCat}"</span>? Existing records categorized as "{deleteConfirmCat}" will keep their data.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-3 py-1.5 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteConfirmCat)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#333] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#222] hover:bg-[#333] text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
