import React, { useState, useRef, useEffect } from 'react';
import { Save, ImagePlus, X, Lock, AlertCircle } from 'lucide-react';
import { Ticket, SparepartStockItem } from '../types';
import { saveTicket, updateTicket, subscribeToSparepartStockItems, decrementSparepartStockItemCount } from '../db';
import { getStoredErrorTypes, subscribeStoredErrorTypes } from './Settings';

interface NewTicketProps {
  editingTicket?: Ticket | null;
  onSaveComplete?: () => void;
}

export const NewTicket: React.FC<NewTicketProps> = ({ editingTicket, onSaveComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    deviceBrand: '',
    deviceModel: '',
    imei: '',
    advancePayment: '',
    errorType: '',
    estimatedCost: '',
    screenLock: 'None',
    screenLockValue: '',
    notes: ''
  });

  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [haveStock, setHaveStock] = useState(false);
  const [stockItems, setStockItems] = useState<SparepartStockItem[]>([]);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>(['']);
  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const stockDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredStockItems = stockItems.filter(item => 
    [item.model, item.name].filter(Boolean).join(' ').toLowerCase().includes(stockSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const unsubErrorTypes = subscribeStoredErrorTypes(setErrorTypes);
    const unsubStock = subscribeToSparepartStockItems(setStockItems);
    return () => {
      unsubErrorTypes();
      unsubStock();
    };
  }, []);

  const [accessories, setAccessories] = useState({
    Charger: false,
    'Memory Card': false,
    Battery: false,
    'Sim Card': false
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (editingTicket) {
      setFormData({
        customerName: editingTicket.customerName,
        phoneNumber: editingTicket.phoneNumber,
        deviceBrand: editingTicket.deviceBrand,
        deviceModel: editingTicket.deviceModel,
        imei: editingTicket.imei || '',
        advancePayment: editingTicket.advancePayment || '',
        errorType: editingTicket.errorType || '',
        estimatedCost: editingTicket.estimatedCost || '',
        screenLock: editingTicket.screenLock,
        screenLockValue: editingTicket.screenLockValue || '',
        notes: editingTicket.notes || ''
      });
      const newAcc = { Charger: false, 'Memory Card': false, Battery: false, 'Sim Card': false };
      editingTicket.accessories.forEach(a => {
        if (a in newAcc) {
          (newAcc as any)[a] = true;
        }
      });
      setAccessories(newAcc);
      setPhotos(editingTicket.photos || []);
      
      if (editingTicket.haveStock) {
        setHaveStock(true);
        if (editingTicket.usedSparepartId) {
          setSelectedStockIds(editingTicket.usedSparepartId.split(',').filter(Boolean));
        } else {
          setSelectedStockIds(['']);
        }
      } else {
        setHaveStock(false);
        setSelectedStockIds(['']);
      }
    }
  }, [editingTicket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setErrorMsg(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccessoryChange = (acc: string) => {
    setAccessories(prev => ({ ...prev, [acc]: !prev[acc as keyof typeof accessories] }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as File);
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.customerName) {
      setErrorMsg("Please enter a customer name.");
      return;
    }
    
    const filteredSelectedIds = haveStock ? selectedStockIds.filter(Boolean) : [];
    if (haveStock && filteredSelectedIds.length === 0) {
      setErrorMsg("Please select a sparepart from the stock.");
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);
    try {
      const generateTicketId = () => {
        return 'TCK-' + Math.floor(100000 + Math.random() * 900000).toString();
      };
      
      let usedSparepartName = undefined;
      if (haveStock && filteredSelectedIds.length > 0) {
        const itemNames = filteredSelectedIds.map(id => {
          const item = stockItems.find(s => s.id === id);
          return item ? [item.model, item.name].filter(Boolean).join(' ') : null;
        }).filter(Boolean);
        if (itemNames.length > 0) {
          usedSparepartName = itemNames.join(', ');
        }
      }
      
      const ticket: Ticket = editingTicket ? {
        ...editingTicket,
        ...formData,
        screenLock: formData.screenLock as any,
        accessories: Object.entries(accessories).filter(([_, v]) => v).map(([k]) => k),
        photos,
        haveStock,
      } : {
        id: crypto.randomUUID(),
        ticketId: generateTicketId(),
        ...formData,
        screenLock: formData.screenLock as any,
        accessories: Object.entries(accessories).filter(([_, v]) => v).map(([k]) => k),
        photos,
        haveStock,
        createdAt: Date.now()
      };
      
      if (haveStock && filteredSelectedIds.length > 0) {
        ticket.usedSparepartId = filteredSelectedIds.join(',');
      }
      
      if (usedSparepartName) {
        ticket.usedSparepartName = usedSparepartName;
      }
      
      if (editingTicket) {
        await updateTicket(ticket);
      } else {
        await saveTicket(ticket);
        
        if (haveStock && filteredSelectedIds.length > 0) {
          for (const id of filteredSelectedIds) {
            await decrementSparepartStockItemCount(id, 1);
          }
        }
      }
      
      setSaveSuccess(true);
      
      if (editingTicket) {
        setTimeout(() => {
          if (onSaveComplete) onSaveComplete();
        }, 1500);
      } else {
        setFormData({
          customerName: '', phoneNumber: '', deviceBrand: '', deviceModel: '',
          imei: '', advancePayment: '', errorType: '', estimatedCost: '', screenLock: 'None', screenLockValue: '', notes: ''
        });
        setAccessories({ Charger: false, 'Memory Card': false, Battery: false, 'Sim Card': false });
        setPhotos([]);
        setHaveStock(false);
        setSelectedStockIds(['']);
        
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save ticket', error);
      setErrorMsg('Failed to save ticket. The Local DB might be having issues.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col font-sans mb-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">{editingTicket ? 'Update Ticket' : 'Open New Ticket'}</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#5C67ED] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : editingTicket ? 'Update' : 'Save'}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-[#EEF2FF] text-[#5C67ED] p-4 border-b border-indigo-100 text-sm font-medium">
          Ticket securely saved to local database!
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 border-b border-red-100 text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <div className="p-3 lg:p-6 grid grid-cols-1 gap-y-6">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Full Name" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="09..." className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Device Brand</label>
              <input type="text" name="deviceBrand" value={formData.deviceBrand} onChange={handleInputChange} placeholder="Brand" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Device Model</label>
              <input type="text" name="deviceModel" value={formData.deviceModel} onChange={handleInputChange} placeholder="Model" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">IMEI (Optional)</label>
              <input type="text" name="imei" value={formData.imei} onChange={handleInputChange} placeholder="IMEI" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Advance Payment (Optional)</label>
              <input type="text" name="advancePayment" value={formData.advancePayment} onChange={handleInputChange} placeholder="Advance Payment" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Error</label>
              <select name="errorType" value={formData.errorType} onChange={handleInputChange} className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-600 appearance-none">
                <option value="">Select Error Type</option>
                {errorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={haveStock}
                    onChange={(e) => setHaveStock(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  HaveStock
                </label>
                <button
                  type="button"
                  disabled={!haveStock}
                  onClick={() => setSelectedStockIds([...selectedStockIds, ''])}
                  className={`text-[11px] px-2 py-1 rounded font-medium border transition-colors ${haveStock ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 cursor-pointer' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                >
                  MutipleSelect
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Estimated Cost</label>
              <input type="text" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} placeholder="Estimated Cost" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          {haveStock && (
            <div className="mt-2 relative flex flex-col gap-2" ref={stockDropdownRef}>
              {selectedStockIds.map((selectedStockId, index) => {
                const isStockDropdownOpen = openDropdownIndex === index;
                return (
                  <div key={index} className="relative">
                    {index === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Select Sparepart Stock</label>}
                    <div className="flex gap-2 items-center">
                      <div 
                        className={`w-full bg-[#F9FAFB] border rounded-md text-sm transition-colors text-slate-600 relative flex items-center ${isStockDropdownOpen ? 'border-[#5C67ED] ring-1 ring-[#5C67ED] bg-white' : 'border-slate-200'}`}
                        onClick={() => {
                          if (!isStockDropdownOpen) {
                            setOpenDropdownIndex(index);
                            setStockSearchTerm('');
                          }
                        }}
                      >
                          {!isStockDropdownOpen && (
                             <div className="absolute inset-0 px-3 py-1.5 flex items-center text-slate-600 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
                                {selectedStockId 
                                  ? [stockItems.find(i => i.id === selectedStockId)?.model, stockItems.find(i => i.id === selectedStockId)?.name].filter(Boolean).join(' ')
                                  : "Select Sparepart"}
                             </div>
                          )}
                          
                          <input
                            type="text"
                            className={`w-full px-3 py-1.5 bg-transparent focus:outline-none ${!isStockDropdownOpen ? 'opacity-0 cursor-pointer' : 'opacity-100'}`}
                            placeholder="Search sparepart..."
                            value={isStockDropdownOpen ? stockSearchTerm : ''}
                            onChange={(e) => setStockSearchTerm(e.target.value)}
                            onFocus={() => { setOpenDropdownIndex(index); setStockSearchTerm(''); }}
                          />
                          
                          {isStockDropdownOpen && (
                            <div className="absolute z-20 w-[calc(100%+2px)] left-[-1px] right-[-1px] bg-white border border-slate-300 rounded-b-md shadow-lg top-[100%] mt-[1px] max-h-60 overflow-y-auto">
                                <div 
                                  className={`px-3 py-2 cursor-pointer text-[#1B6AD2] border-b border-slate-100 ${!selectedStockId ? 'bg-[#1864E1] text-white' : 'hover:bg-slate-50'}`}
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const newArr = [...selectedStockIds];
                                    newArr[index] = '';
                                    setSelectedStockIds(newArr);
                                    setOpenDropdownIndex(null); 
                                    setStockSearchTerm(''); 
                                  }}
                                >
                                  Select Sparepart
                                </div>
                                {filteredStockItems.map(item => (
                                  <div 
                                    key={item.id}
                                    className={`px-3 py-2.5 cursor-pointer text-slate-700 hover:bg-slate-50 border-b border-slate-50 ${selectedStockId === item.id ? 'bg-[#EEF2FF]' : ''}`}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const newArr = [...selectedStockIds];
                                      newArr[index] = item.id;
                                      setSelectedStockIds(newArr); 
                                      setOpenDropdownIndex(null); 
                                      setStockSearchTerm(''); 
                                    }}
                                  >
                                    {[item.model, item.name].filter(Boolean).join(' ')}
                                  </div>
                                ))}
                                {filteredStockItems.length === 0 && (
                                  <div className="px-3 py-3 text-slate-500 text-center text-sm">
                                     No parts found
                                  </div>
                                )}
                            </div>
                          )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArr = [...selectedStockIds];
                            newArr.splice(index, 1);
                            setSelectedStockIds(newArr);
                          }}
                          className="text-slate-400 hover:text-red-500 rounded-full p-1 transition-colors flex-shrink-0 bg-slate-50 border border-slate-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3 bg-[#F8F9FA] p-3 rounded-lg border border-slate-100">
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
              <Lock size={12} className="text-slate-400" />
              Screen Lock
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {['None', 'Pin', 'Password', 'Pattern'].map(lock => (
                <button
                  key={lock}
                  onClick={() => setFormData(p => ({ ...p, screenLock: lock, screenLockValue: lock === 'None' ? '' : p.screenLockValue }))}
                  className={`py-1 text-xs font-medium rounded-md border transition-colors ${
                    formData.screenLock === lock 
                      ? 'bg-[#5C67ED] border-[#5C67ED] text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lock}
                </button>
              ))}
            </div>
            {formData.screenLock !== 'None' && formData.screenLock !== 'Pattern' && (
              <div className="mt-1.5 text-center">
                <input
                  type={formData.screenLock === 'Password' ? 'text' : 'text'}
                  name="screenLockValue"
                  value={formData.screenLockValue}
                  onChange={handleInputChange}
                  placeholder={`Enter ${formData.screenLock}`}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                />
              </div>
            )}
            {formData.screenLock === 'Pattern' && (
              <div className="mt-1.5 p-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
                 <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                     const isSelected = formData.screenLockValue.includes(num.toString());
                     const orderIndex = formData.screenLockValue.indexOf(num.toString());
                     
                     return (
                       <button
                         key={num}
                         type="button"
                         onClick={() => {
                           if (!isSelected) {
                             setFormData(p => ({...p, screenLockValue: p.screenLockValue ? p.screenLockValue + num : num.toString()}))
                           }
                         }}
                         className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                           isSelected ? 'bg-[#5C67ED] text-white scale-110 shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-transparent'
                         }`}
                       >
                         {isSelected ? (orderIndex + 1) : num}
                       </button>
                     );
                   })}
                 </div>
                 {formData.screenLockValue && (
                   <div className="text-center mt-1">
                     <button type="button" onClick={() => setFormData(p => ({...p, screenLockValue: ''}))} className="text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors">
                       Clear Pattern
                     </button>
                   </div>
                 )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Included Accessories</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
              {Object.keys(accessories).map((acc) => (
                <label key={acc} className="flex items-center gap-1.5 p-1.5 border border-slate-200 rounded-md cursor-pointer hover:border-indigo-300 transition-colors bg-white shadow-sm">
                  <input 
                    type="checkbox" 
                    checked={accessories[acc as keyof typeof accessories]} 
                    onChange={() => handleAccessoryChange(acc)}
                    className="w-3 h-3 text-[#5C67ED] rounded border-slate-300 focus:ring-[#5C67ED]"
                  />
                  <span className="text-[11px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">{acc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Service Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Details" 
                rows={1}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-sm h-12"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Photos (Optional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-300 hover:border-[#5C67ED] rounded-md p-1.5 flex justify-center items-center h-12 bg-white cursor-pointer transition-colors group gap-2"
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <ImagePlus size={14} className="text-slate-400 group-hover:text-[#5C67ED]" />
                <span className="text-[10px] font-medium text-slate-500 group-hover:text-[#5C67ED]">Upload</span>
              </div>
            </div>
          </div>
            
          {photos.length > 0 && (
            <div className="grid grid-cols-8 gap-1.5 mt-1.5">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 bg-white shadow-sm group">
                  <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(index)}
                    className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
