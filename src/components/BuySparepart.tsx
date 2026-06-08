import React, { useState, useEffect } from 'react';
import { ShoppingCart, List, PlusCircle, Check, Trash2, X, Image as ImageIcon, Camera } from 'lucide-react';
import { SparepartItem } from '../types';
import { saveSparepartItem, getSparepartItems, deleteSparepartItem } from '../db';

export const BuySparepart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [items, setItems] = useState<SparepartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [itemDesc1, setItemDesc1] = useState('');
  const [itemDesc2, setItemDesc2] = useState('');
  const [itemDesc3, setItemDesc3] = useState('');
  const [photo1, setPhoto1] = useState('');
  const [photo2, setPhoto2] = useState('');
  const [photo3, setPhoto3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingItem, setViewingItem] = useState<SparepartItem | null>(null);
  const [editingItem, setEditingItem] = useState<SparepartItem | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const loadedItems = await getSparepartItems();
    setItems(loadedItems);
    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhoto: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress to limit size below 1MB
            setPhoto(dataUrl);
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !itemDesc1) return;

    setIsSubmitting(true);
    const combinedItemDesc = [itemDesc1, itemDesc2, itemDesc3].filter(Boolean).join('\n');
    
    const newItem: SparepartItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name,
      item: combinedItemDesc,
      photo1,
      photo2,
      photo3,
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
    };

    await saveSparepartItem(newItem);
    await loadItems();
    
    // Reset form
    handleCancelEdit();
    
    setIsSubmitting(false);
    setActiveTab('list');
  };

  const handleEdit = (item: SparepartItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setName(item.name);
    const descs = item.item.split('\n');
    setItemDesc1(descs[0] || '');
    setItemDesc2(descs[1] || '');
    setItemDesc3(descs[2] || '');
    setPhoto1(item.photo1 || '');
    setPhoto2(item.photo2 || '');
    setPhoto3(item.photo3 || '');
    setActiveTab('new');
    setViewingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setName('');
    setItemDesc1('');
    setItemDesc2('');
    setItemDesc3('');
    setPhoto1('');
    setPhoto2('');
    setPhoto3('');
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

    await deleteSparepartItem(deletingId);
    setItems(items.filter(item => item.id !== deletingId));
    if (viewingItem?.id === deletingId) setViewingItem(null);
    setDeletingId(null);
    setDeletePassword('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col font-sans mb-8">
      <div className="p-6 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Buy Sparepart</h2>
            <p className="text-sm text-slate-500">Order spare parts or add to list</p>
          </div>
        </div>
      </div>

      <div className="px-6 border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2"><PlusCircle size={16} /> Add New</div>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2"><List size={16} /> See List</div>
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 bg-slate-50 rounded-b-2xl">
        {activeTab === 'new' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{editingItem ? 'Edit Spare Part Requisition' : 'New Spare Part Requisition'}</h3>
              {editingItem && (
                <button type="button" onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-700">Cancel Edit</button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name / Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  placeholder="e.g. iPhone 13 Screen"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sparepart Item (Description/Code)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={itemDesc1}
                    onChange={e => setItemDesc1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    placeholder="Item 1 (e.g. Screen Replacement, Original Grade A...)"
                    required
                  />
                  <input
                    type="text"
                    value={itemDesc2}
                    onChange={e => setItemDesc2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    placeholder="Item 2 (Optional)"
                  />
                  <input
                    type="text"
                    value={itemDesc3}
                    onChange={e => setItemDesc3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    placeholder="Item 3 (Optional)"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700">Photos</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Photo 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Photo 1</label>
                    {photo1 ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group">
                        <img src={photo1} alt="Photo 1" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhoto1('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-colors">
                        <Camera size={24} className="text-slate-400" />
                        <span className="text-xs text-slate-500 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto1)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Photo 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Photo 2</label>
                    {photo2 ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group">
                        <img src={photo2} alt="Photo 2" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhoto2('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-colors">
                        <Camera size={24} className="text-slate-400" />
                        <span className="text-xs text-slate-500 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto2)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Photo 3 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Photo 3</label>
                    {photo3 ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group">
                        <img src={photo3} alt="Photo 3" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhoto3('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-colors">
                        <Camera size={24} className="text-slate-400" />
                        <span className="text-xs text-slate-500 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto3)} className="hidden" />
                      </label>
                    )}
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting || !name || !itemDesc1}
                  className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Check size={18} />
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Sparepart Record' : 'Save Sparepart Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
                <h4 className="text-slate-700 font-medium">No spare parts recorded</h4>
                <p className="text-slate-500 text-sm mt-1">Add a new spare part to see it here</p>
                <button 
                  onClick={() => setActiveTab('new')}
                  className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                >
                  Add New
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 transition-colors cursor-pointer flex flex-col h-full"
                    onClick={() => setViewingItem(item)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => handleEdit(item, e)}
                          className="text-slate-400 hover:text-sky-500 p-1 bg-slate-50 rounded-lg hover:bg-sky-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(item.id, e)}
                          className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg flex-1">
                      <ol className="list-decimal pl-4 space-y-1 font-medium">
                        {item.item.split('\n').filter(Boolean).map((line, i) => (
                           <li key={i}>{line}</li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      {item.photo1 && (
                         <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo1} className="w-full h-full object-cover" alt="Thumb 1" /></div>
                      )}
                      {item.photo2 && (
                         <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo2} className="w-full h-full object-cover" alt="Thumb 2" /></div>
                      )}
                      {item.photo3 && (
                         <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo3} className="w-full h-full object-cover" alt="Thumb 3" /></div>
                      )}
                      {!item.photo1 && !item.photo2 && !item.photo3 && (
                        <div className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon size={14} /> No Photos</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Spare Part Details</h3>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-sm bg-slate-50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xl font-bold text-slate-800 mb-1">{viewingItem.name}</div>
                <div className="text-xs text-slate-500 mb-4">{new Date(viewingItem.createdAt).toLocaleString()}</div>
                
                <h4 className="font-semibold text-slate-700 mb-2 border-t border-slate-100 pt-3">Sparepart Description</h4>
                <div className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                  <ol className="list-decimal pl-5 space-y-1.5 font-medium text-sm">
                    {viewingItem.item.split('\n').filter(Boolean).map((line, i) => (
                       <li key={i}>{line}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {(viewingItem.photo1 || viewingItem.photo2 || viewingItem.photo3) && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-700 mb-3">Photos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {viewingItem.photo1 && (
                      <a href={viewingItem.photo1} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square">
                        <img src={viewingItem.photo1} alt="Photo 1" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                    {viewingItem.photo2 && (
                      <a href={viewingItem.photo2} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square">
                        <img src={viewingItem.photo2} alt="Photo 2" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                    {viewingItem.photo3 && (
                      <a href={viewingItem.photo3} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square">
                        <img src={viewingItem.photo3} alt="Photo 3" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <button 
                onClick={(e) => {
                  if (viewingItem) handleEdit(viewingItem, e);
                }}
                className="flex-1 py-2 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => setViewingItem(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-500 text-sm mb-4">Please enter the password to confirm deletion.</p>
            
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                className={`w-full px-3 py-2 bg-slate-50 border ${deleteError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-orange-500'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white transition-shadow`}
                autoFocus
              />
              {deleteError && (
                <p className="text-red-500 text-xs mt-1">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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

