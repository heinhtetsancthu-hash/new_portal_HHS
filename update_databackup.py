with open("src/components/DataBackup.tsx", "r") as f:
    code = f.read()

import_replacement = """import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, X, Cloud, CloudOff } from 'lucide-react';
import { exportAllData, importAllData } from '../db';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';"""
code = code.replace("import React, { useState, useRef } from 'react';\nimport { Download, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';\nimport { getTickets, clearAllTickets, insertTickets } from '../db';\nimport { Ticket } from '../types';", import_replacement)

# Replace handleExport 
handle_export_target = """  const handleExport = async () => {
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
  };"""
  
handle_export_replacement = """  const handleExport = async () => {
    try {
      setLoading(true);
      const allData = await exportAllData();
      const backupData = JSON.stringify(allData, null, 2);
      
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hhs_repair_portal_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Local Backup exported successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to export backup.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDriveBackup = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) throw new Error("No access token found");
      
      const allData = await exportAllData();
      const backupData = JSON.stringify(allData, null, 2);
      
      const metadata = {
        name: `hhs_repair_portal_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([backupData], { type: 'application/json' }));
      
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });
      
      if (!res.ok) throw new Error('Drive API error');
      
      setMessage({ text: 'Backup saved to Google Drive successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to backup to Google Drive.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDriveRestore = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) throw new Error("No access token found");
      
      const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/json' and trashed=false", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error.message || "Drive API error");
      
      if (!data.files || data.files.length === 0) {
        setMessage({ text: 'No backups found in Google Drive.', type: 'error' });
        setLoading(false);
        return;
      }
      
      // Get the most recent file
      const fileId = data.files[0].id;
      
      const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!downloadRes.ok) throw new Error("Failed to download from Drive");
      
      const backupContent = await downloadRes.text();
      const parsedData = JSON.parse(backupContent);
      
      await importAllData(parsedData);
      
      setMessage({ text: 'Data restored successfully from Google Drive.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to restore backup from Google Drive.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
"""

code = code.replace(handle_export_target, handle_export_replacement)

# Replace confirmImport
confirm_import_target = """        const parsedTickets = JSON.parse(content);
        
        if (!Array.isArray(parsedTickets)) {
          throw new Error('Invalid format');
        }
        
        const tickets: Ticket[] = parsedTickets.map(t => ({
          ...t,
          id: String(t.id || `TKT-${Date.now()}-${Math.floor(Math.random() * 10000)}`).replace(/[^a-zA-Z0-9_-]/g, ''),
          customerName: String(t.customerName || ''),
          phoneNumber: String(t.phoneNumber || ''),
          deviceBrand: String(t.deviceBrand || ''),
          deviceModel: String(t.deviceModel || ''),
          imei: String(t.imei || ''),
          errorType: String(t.errorType || ''),
          estimatedCost: String(t.estimatedCost || ''),
          screenLock: String(t.screenLock || ''),
          notes: String(t.notes || ''),
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        }));
        
        await clearAllTickets();
        await insertTickets(tickets);"""

confirm_import_replacement = """        const parsedData = JSON.parse(content);
        await importAllData(parsedData);"""
        
code = code.replace(confirm_import_target, confirm_import_replacement)

# Replace grid to 4 buttons
grid_target = """        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>"""

grid_replacement = """        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Local */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Local Backup</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Download a JSON file containing all your data.</p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-[#5C67ED] hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <Download size={18} />
              Local Backup
            </button>
          </div>

          {/* Import Local */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Local Restore</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Restore data from a previously saved JSON backup.</p>
            
            <label className={`w-full ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'} font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm`}>
              <Upload size={18} />
              Local Restore
              <input
                type="file"
                accept=".json"
                onChange={handleImportSelect}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Export Drive */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">GoogleDrive Backup</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Save a backup securely to your Google Drive.</p>
            <button
              onClick={handleDriveBackup}
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <Cloud size={18} />
              GoogleDrive Backup
            </button>
          </div>

          {/* Import Drive */}
          <div className="border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudOff size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Restore from drive</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Restore your latest backup from Google Drive.</p>
            
            <button
              onClick={handleDriveRestore}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <CloudOff size={18} />
              Restore from drive
            </button>
          </div>
        </div>"""
        
code = code.replace(grid_target, grid_replacement)

# Update texts
code = code.replace("tickets and photos", "data").replace("all existing tickets", "all existing data")

with open("src/components/DataBackup.tsx", "w") as f:
    f.write(code)
print("Success")
