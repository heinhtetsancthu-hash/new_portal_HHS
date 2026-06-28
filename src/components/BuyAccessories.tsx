import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, PlusCircle, List, Check, Trash2, X, Image as ImageIcon, Camera } from 'lucide-react';
import { AccessoryOrder } from '../types';
import { saveAccessoryOrder, deleteAccessoryOrder, subscribeToAccessoryOrders } from '../db';
import { auth } from '../firebase';

interface BuyAccessoriesProps {
  onBack: () => void;
}

export const BuyAccessories: React.FC<BuyAccessoriesProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [items, setItems] = useState<AccessoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [photo1, setPhoto1] = useState('');
  const [photo2, setPhoto2] = useState('');
  const [photo3, setPhoto3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingItem, setViewingItem] = useState<AccessoryOrder | null>(null);
  const [editingItem, setEditingItem] = useState<AccessoryOrder | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth.currentUser) {
      setLoading(true);
      unsubscribe = subscribeToAccessoryOrders((fetchedItems) => {
        setItems(fetchedItems);
        setLoading(false);
      });
    }
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhoto: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Compress heavily to prevent 1MB limit
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
    if (!customerName || !phoneNumber || !item1) return;

    setIsSubmitting(true);
    
    const newOrder: AccessoryOrder = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      customerName,
      phoneNumber,
      item1,
      item2,
      item3,
      photo1,
      photo2,
      photo3,
      createdAt: editingItem ? editingItem.createdAt : Date.now(),
    };

    try {
      await saveAccessoryOrder(newOrder);
      handleCancelEdit();
      setActiveTab('list');
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: AccessoryOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setCustomerName(item.customerName);
    setPhoneNumber(item.phoneNumber);
    setItem1(item.item1);
    setItem2(item.item2);
    setItem3(item.item3);
    setPhoto1(item.photo1 || '');
    setPhoto2(item.photo2 || '');
    setPhoto3(item.photo3 || '');
    setActiveTab('new');
    setViewingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setCustomerName('');
    setPhoneNumber('');
    setItem1('');
    setItem2('');
    setItem3('');
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

    await deleteAccessoryOrder(deletingId);
    if (viewingItem?.id === deletingId) setViewingItem(null);
    setDeletingId(null);
    setDeletePassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <h1 className="text-lg font-bold text-slate-800">Buy Accessories</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 pt-4 border-b border-slate-200 flex space-x-6">
            <button
              onClick={() => setActiveTab('new')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2"><PlusCircle size={16} /> Add New Order</div>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <List size={16} /> See Order List
                {items.length > 0 && (
                  <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-bold">{items.length}</span>
                )}
              </div>
            </button>
          </div>

          <div className="p-6 bg-slate-50">
            {activeTab === 'new' && (
              <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {editingItem ? 'Edit Accessory Order' : 'New Accessory Order'}
                  </h3>
                  {editingItem && (
                    <button type="button" onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">Cancel Edit</button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="e.g. 09..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Items (Description/Code)</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item1}
                        onChange={e => setItem1(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="Item 1 (e.g. iPhone 13 Pro Max Case)"
                        required
                      />
                      <input
                        type="text"
                        value={item2}
                        onChange={e => setItem2(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="Item 2 (Optional)"
                      />
                      <input
                        type="text"
                        value={item3}
                        onChange={e => setItem3(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="Item 3 (Optional)"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700">Reference Photos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Photo 1 */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Photo 1</label>
                        {photo1 ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group shadow-sm">
                            <img src={photo1} alt="Photo 1" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setPhoto1('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                            <Camera size={24} className="text-slate-400" />
                            <span className="text-xs text-slate-500 mt-1">Upload</span>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto1)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Photo 2 */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Photo 2</label>
                        {photo2 ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group shadow-sm">
                            <img src={photo2} alt="Photo 2" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setPhoto2('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                            <Camera size={24} className="text-slate-400" />
                            <span className="text-xs text-slate-500 mt-1">Upload</span>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto2)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Photo 3 */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Photo 3</label>
                        {photo3 ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group shadow-sm">
                            <img src={photo3} alt="Photo 3" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setPhoto3('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                            <Camera size={24} className="text-slate-400" />
                            <span className="text-xs text-slate-500 mt-1">Upload</span>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, setPhoto3)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting || !customerName || !phoneNumber || !item1}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                    >
                      <Check size={18} />
                      {isSubmitting ? 'Saving...' : editingItem ? 'Update Order Record' : 'Save Order Record'}
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
                  <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                    <h4 className="text-slate-700 font-semibold text-lg">No accessory orders found</h4>
                    <p className="text-slate-500 mt-1">Create your first accessory order request</p>
                    <button 
                      onClick={() => setActiveTab('new')}
                      className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
                    >
                      <PlusCircle size={18} /> Add New Order
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md cursor-pointer flex flex-col h-full"
                        onClick={() => setViewingItem(item)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.customerName}</h4>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>{new Date(item.createdAt).toLocaleString()}</div>
                              <a href={`tel:${item.phoneNumber}`} onClick={(e) => e.stopPropagation()} className="font-medium text-blue-600 hover:underline">{item.phoneNumber}</a>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => handleEdit(item, e)}
                              className="text-slate-400 hover:text-blue-500 p-1.5 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(item.id, e)}
                              className="text-slate-400 hover:text-red-500 p-1.5 bg-slate-50 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-lg flex-1 border border-slate-100">
                          <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                            {item.item1 && <li>{item.item1}</li>}
                            {item.item2 && <li>{item.item2}</li>}
                            {item.item3 && <li>{item.item3}</li>}
                          </ol>
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          {item.photo1 && (
                             <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo1} className="w-full h-full object-cover" alt="Thumb 1" /></div>
                          )}
                          {item.photo2 && (
                             <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo2} className="w-full h-full object-cover" alt="Thumb 2" /></div>
                          )}
                          {item.photo3 && (
                             <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-sm"><img src={item.photo3} className="w-full h-full object-cover" alt="Thumb 3" /></div>
                          )}
                          {!item.photo1 && !item.photo2 && !item.photo3 && (
                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md"><ImageIcon size={14} /> No Photos</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-lg">Accessory Order Details</h3>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/50">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{viewingItem.customerName}</h2>
                    <a href={`tel:${viewingItem.phoneNumber}`} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                      {viewingItem.phoneNumber}
                    </a>
                  </div>
                  <div className="text-right">
                     <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Date</span>
                     <div className="text-sm font-medium text-slate-600">{new Date(viewingItem.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-3 border-t border-slate-100 pt-4">Order Items</h4>
                <div className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <ol className="list-decimal pl-5 space-y-2 font-medium text-sm">
                    {viewingItem.item1 && <li>{viewingItem.item1}</li>}
                    {viewingItem.item2 && <li>{viewingItem.item2}</li>}
                    {viewingItem.item3 && <li>{viewingItem.item3}</li>}
                  </ol>
                </div>
              </div>

              {(viewingItem.photo1 || viewingItem.photo2 || viewingItem.photo3) && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-4">Reference Photos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {viewingItem.photo1 && (
                      <a href={viewingItem.photo1} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                        <img src={viewingItem.photo1} alt="Photo 1" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                    {viewingItem.photo2 && (
                      <a href={viewingItem.photo2} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                        <img src={viewingItem.photo2} alt="Photo 2" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                    {viewingItem.photo3 && (
                      <a href={viewingItem.photo3} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                        <img src={viewingItem.photo3} alt="Photo 3" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
              <button 
                onClick={(e) => {
                  if (viewingItem) handleEdit(viewingItem, e);
                }}
                className="flex-1 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                Edit Order
              </button>
              <button 
                onClick={() => setViewingItem(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
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
                className={`w-full px-4 py-2.5 bg-slate-50 border ${deleteError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:bg-white transition-shadow`}
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
