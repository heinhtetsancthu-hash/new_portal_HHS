import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { getTickets, clearAllTickets, insertTickets } from '../db';
import { Ticket } from '../types';

export const DataBackup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      const tickets = await getTickets();
      const backupData = JSON.stringify(tickets, null, 2);
      
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repair-center-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ text: 'Backup exported successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to export backup.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileToImport(file);
    if (e.target) e.target.value = '';
  };

  const confirmImport = () => {
    if (!fileToImport) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const tickets: Ticket[] = JSON.parse(content);
        
        if (!Array.isArray(tickets)) {
          throw new Error('Invalid format');
        }

        await clearAllTickets();
        await insertTickets(tickets);
        setMessage({ text: 'Data restored successfully from backup.', type: 'success' });
      } catch (error) {
        console.error(error);
        setMessage({ text: 'Failed to parse or restore backup file.', type: 'error' });
      } finally {
        setLoading(false);
        setFileToImport(null);
      }
    };
    reader.onerror = () => {
      setMessage({ text: 'Failed to read the selected file.', type: 'error' });
      setLoading(false);
      setFileToImport(null);
    };
    reader.readAsText(fileToImport);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">Database Backup & Restore</h3>
        <p className="text-sm text-slate-500 mt-1">Export your data to keep it safe, or import a previous backup.</p>
      </div>

      <div className="p-6 space-y-8">
        {message && (
          <div className={`p-4 rounded-xl flex gap-3 text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Export Data</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Download a JSON file containing all tickets and photos.</p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-[#5C67ED] hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <Download size={18} />
              Save Backup
            </button>
          </div>

          {/* Import */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Import Data</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Restore tickets from a previously saved JSON backup.</p>
            
            <label className={`w-full ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'} font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm`}>
              <Upload size={18} />
              Restore Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportSelect}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {fileToImport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Restore Backup?</h3>
            <p className="text-slate-500 text-sm mb-6">Warning: Restoring a backup will replace all existing tickets. This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setFileToImport(null)} 
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmImport} 
                className="px-4 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors flex-1"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
