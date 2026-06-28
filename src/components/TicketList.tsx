import React, { useEffect, useState, useRef } from 'react';
import { Eye, Edit2, Trash2, Calendar, Filter, X, ChevronDown, Check, Save, Download, FileText, Image as ImageIcon, Phone } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { getTickets, updateTicket, deleteTicket } from '../db';
import { Ticket, TicketStatus } from '../types';
import { getStoredErrorTypes, subscribeStoredErrorTypes } from './Settings';
import { TicketReceipt } from './TicketReceipt';

// Helper for date calculations
const isToday = (ts: number) => new Date(ts).toDateString() === new Date().toDateString();
const isYesterday = (ts: number) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(ts).toDateString() === yesterday.toDateString();
};

interface TicketListProps {
  onEditTicket?: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ onEditTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState<string>('All'); // All, Today, Yesterday, Range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // For Editing
  const [editData, setEditData] = useState<Ticket | null>(null);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [editAccessories, setEditAccessories] = useState<Record<string, boolean>>({});

  const [promptCostTicket, setPromptCostTicket] = useState<{ticket: Ticket, newStatus: TicketStatus} | null>(null);
  const [realCostValue, setRealCostValue] = useState("");

  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [pendingActionCallback, setPendingActionCallback] = useState<(() => void) | null>(null);
  const [expectedPassword, setExpectedPassword] = useState('1471656');

  const handleExportPNG = async () => {
    if (!receiptRef.current || !selectedTicket) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(receiptRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${selectedTicket.customerName}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (e) {
      console.error('Failed to export PNG', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!receiptRef.current || !selectedTicket) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(receiptRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (receiptRef.current.offsetHeight * pdfWidth) / receiptRef.current.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedTicket.customerName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReportPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Grouping by errorType
    const grouped: Record<string, { count: number, total: number }> = {};
    let grandTotal = 0;

    filteredTickets.forEach(t => {
      const eType = t.errorType || 'Unknown Error';
      const costString = (t.status === 'Return To Customer' && t.realCost) ? t.realCost : t.estimatedCost;
      const match = costString?.match(/-?[\d,.]+/);
      let amount = 0;
      if (match) {
        amount = parseFloat(match[0].replace(/,/g, ''));
        if (isNaN(amount)) amount = 0;
      }
      
      if (!grouped[eType]) {
        grouped[eType] = { count: 0, total: 0 };
      }
      grouped[eType].count += 1;
      grouped[eType].total += amount;
      grandTotal += amount;
    });

    let y = 20;
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Service Report", 14, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, y);
    y += 6;
    const statusList = `Visible Statuses: ${visibleStatuses.join(', ')}`;
    pdf.text(`Status Filter: ${statusList}`, 14, y);
    y += 6;
    pdf.text(`Date Filter: ${filterDate}`, 14, y);
    if (filterDate === 'Range') {
       y += 6;
       pdf.text(`Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, 14, y);
    }
    y += 10;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.text("Error Category", 14, y);
    pdf.text("Count", 120, y);
    pdf.text("Total Amount", 150, y);
    y += 2;
    pdf.line(14, y, 196, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    Object.keys(grouped).forEach(cat => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      const val = grouped[cat];
      // Format category (if it's too long, truncate it)
      const catText = cat.length > 50 ? cat.substring(0, 47) + '...' : cat;
      pdf.text(catText, 14, y);
      pdf.text(val.count.toString(), 120, y);
      const formattedAmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val.total);
      pdf.text(formattedAmt, 150, y);
      y += 8;
    });

    y += 2;
    pdf.line(14, y, 196, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Grand Total:", 14, y);
    pdf.text(new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(grandTotal), 150, y);

    pdf.save(`Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const fetchTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const unsub = subscribeStoredErrorTypes(setErrorTypes);
    return () => unsub();
  }, []);

  const promptPasswordForAction = (callback: () => void, password = '1471656') => {
    setExpectedPassword(password);
    setPendingActionCallback(() => callback);
    setShowPasswordPrompt(true);
  };

  const executePendingAction = () => {
    if (passwordInput === expectedPassword) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
      setWrongPassword(false);
      if (pendingActionCallback) {
        pendingActionCallback();
        setPendingActionCallback(null);
      }
    } else {
      setWrongPassword(true);
    }
  };

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (newStatus === 'Return To Customer' && ticket.status !== 'Return To Customer') {
      promptPasswordForAction(() => {
        setPromptCostTicket({ ticket, newStatus });
        setRealCostValue(ticket.estimatedCost || '');
      });
      return;
    }
    
    promptPasswordForAction(async () => {
      const updated = { ...ticket, status: newStatus };
      await updateTicket(updated);
      setTickets(tickets.map(t => t.id === ticket.id ? updated : t));
      if (selectedTicket?.id === ticket.id) setSelectedTicket(updated);
    });
  };

  const submitCostPrompt = async () => {
    if (!promptCostTicket) return;
    const { ticket, newStatus } = promptCostTicket;
    const updated = { ...ticket, status: newStatus, returnedAt: Date.now(), realCost: realCostValue };
    await updateTicket(updated);
    setTickets(tickets.map(t => t.id === ticket.id ? updated : t));
    if (selectedTicket?.id === ticket.id) setSelectedTicket(updated);
    
    setPromptCostTicket(null);
    setRealCostValue('');
  };

  const triggerDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const ticket = tickets.find(t => t.id === id);
    if (ticket && ticket.status === 'Return To Customer') {
      promptPasswordForAction(() => {
        setTicketToDelete(id);
      }, '070288');
    } else {
      setTicketToDelete(id);
    }
  };

  const triggerEdit = (ticket: Ticket, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (ticket.status === 'Return To Customer') {
      promptPasswordForAction(() => {
        if (onEditTicket) onEditTicket(ticket);
        else {
          openTicket(ticket);
          setTimeout(startEdit, 0);
        }
      }, '070288');
    } else {
      if (onEditTicket) onEditTicket(ticket);
      else {
        openTicket(ticket);
        setTimeout(startEdit, 0);
      }
    }
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    await deleteTicket(ticketToDelete);
    setTickets(tickets.filter(t => t.id !== ticketToDelete));
    if (selectedTicket?.id === ticketToDelete) {
      setSelectedTicket(null);
      setIsEditing(false);
    }
    setTicketToDelete(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editData) return;
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleAccChange = (acc: string) => {
    setEditAccessories(prev => ({ ...prev, [acc]: !prev[acc] }));
  };

  const saveEdit = async () => {
    if (!editData) return;
    const updatedTicket = {
      ...editData,
      accessories: Object.keys(editAccessories).filter(k => editAccessories[k])
    };
    await updateTicket(updatedTicket);
    setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setIsEditing(false);
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (!selectedTicket) return;
    setEditData({ ...selectedTicket });
    const accMap: Record<string, boolean> = { Charger: false, 'Memory Card': false, Battery: false, 'Sim Card': false };
    selectedTicket.accessories.forEach(a => accMap[a] = true);
    setEditAccessories(accMap);
    setIsEditing(true);
  };

  const toggleVisibleStatus = (status: string) => {
    setVisibleStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    if (visibleStatuses.length > 0 && !visibleStatuses.includes(t.status || 'Pending')) return false;
    
    const dateToCheck = t.status === 'Return To Customer' && t.returnedAt ? t.returnedAt : t.createdAt;

    if (filterDate === 'Today') return isToday(dateToCheck);
    if (filterDate === 'Yesterday') return isYesterday(dateToCheck);
    if (filterDate === 'Range') {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + 86400000; // End of day
      if (dateToCheck < start || dateToCheck >= end) return false;
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = t.customerName.toLowerCase().includes(query);
      const matchId = t.ticketId?.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
      const matchModel = t.deviceModel.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchModel) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'Pending': 1,
      'Completed': 2,
      'Return To Customer': 3,
      'Not Repair': 4
    };
    const statusA = a.status || 'Pending';
    const statusB = b.status || 'Pending';
    const orderA = statusOrder[statusA] || 99;
    const orderB = statusOrder[statusB] || 99;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return b.createdAt - a.createdAt;
  });

  const totalAmount = filteredTickets.reduce((sum, ticket) => {
    const costString = (ticket.status === 'Return To Customer' && ticket.realCost) ? ticket.realCost : ticket.estimatedCost;
    const match = costString?.match(/-?[\d,.]+/);
    if (match) {
      const num = parseFloat(match[0].replace(/,/g, ''));
      if (!isNaN(num)) return sum + num;
    }
    return sum;
  }, 0);
  
  const formattedTotalAmount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(totalAmount);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-100">
        Loading tickets from local database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Search</label>
          <input 
            type="text" 
            placeholder="Search Name, ID or Model..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full px-3 py-2 bg-[#F9FAFB] border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex-1 md:flex-none">
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Show Statuses</label>
          <div className="flex flex-wrap items-center gap-3 bg-[#F9FAFB] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
            {['Pending', 'Completed', 'Not Repair', 'Return To Customer'].map(status => (
              <label key={status} className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={visibleStatuses.includes(status)} 
                  onChange={() => toggleVisibleStatus(status)}
                  className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Date Filter</label>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 bg-[#F9FAFB] border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500">
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Range">Date Range</option>
          </select>
        </div>

        {filterDate === 'Range' && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 bg-[#F9FAFB] border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 bg-[#F9FAFB] border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </>
        )}
      </div>

      {/* Results Count & Total */}
      <div className="flex justify-between items-center text-sm font-medium px-1">
        <p className="text-slate-500">Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-3">
          <p className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm inline-flex items-center gap-1.5 font-bold">
            Total Amount: {formattedTotalAmount}
          </p>
          <button 
            onClick={handleExportReportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-sm transition-colors"
          >
            <FileText size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No tickets match your filters.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-280px)]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-[#F8F9FA] text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-100 sticky top-0 z-10">
                <tr className="shadow-sm">
                  <th className="px-6 py-4 bg-[#F8F9FA]">Customer</th>
                  <th className="px-6 py-4 bg-[#F8F9FA]">Device Info</th>
                  <th className="px-6 py-4 bg-[#F8F9FA]">Status & Action</th>
                  <th className="px-6 py-4 text-right bg-[#F8F9FA]">Date</th>
                  <th className="px-6 py-4 text-right bg-[#F8F9FA]">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => {
                  const status = ticket.status || 'Pending';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-[#F8F9FA] transition-colors cursor-pointer" onClick={() => openTicket(ticket)}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{ticket.customerName}</div>
                        <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                          {ticket.phoneNumber}
                          <a href={`tel:${ticket.phoneNumber}`} onClick={(e) => e.stopPropagation()} className="text-indigo-500 hover:text-indigo-600 transition-colors p-1" title="Call Customer">
                            <Phone size={12} />
                          </a>
                        </div>
                        {ticket.ticketId && <div className="text-indigo-600 text-[10px] font-bold mt-1 tracking-wide">{ticket.ticketId}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{ticket.deviceBrand} {ticket.deviceModel}</div>
                        <div className="text-slate-400 text-xs mt-0.5">Error: {ticket.errorType || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={status} 
                          onChange={(e) => handleStatusChange(ticket, e.target.value as TicketStatus)}
                          className={`text-xs font-semibold rounded-md px-2 py-1 focus:outline-none appearance-none cursor-pointer ${
                            status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Not Repair">Not Repair</option>
                          <option value="Return To Customer">Return To Customer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs">
                        <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        {status === 'Return To Customer' && (
                          <div className="mt-1">
                            {ticket.returnedAt && <div className="text-amber-600 font-medium">Returned: {new Date(ticket.returnedAt).toLocaleDateString()}</div>}
                            {ticket.realCost && <div className="text-emerald-600 font-medium mt-0.5">Cost: {ticket.realCost}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 text-slate-400">
                           <button onClick={(e) => { e.stopPropagation(); openTicket(ticket); }} className="hover:text-indigo-600 p-1"><Eye size={16} /></button>
                           <button onClick={(e) => triggerEdit(ticket, e)} className="hover:text-amber-500 p-1"><Edit2 size={16} /></button>
                           <button onClick={(e) => triggerDelete(ticket.id, e)} className="hover:text-red-500 p-1"><Trash2 size={16} /></button>
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

      {/* Modal View / Edit */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8F9FA]">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {isEditing ? 'Edit Ticket' : 'Ticket Details'}
                {!isEditing && selectedTicket.ticketId && (
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md tracking-wider">
                    {selectedTicket.ticketId}
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <button onClick={handleExportPNG} disabled={isExporting} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">
                      <ImageIcon size={14} /> PNG
                    </button>
                    <button onClick={handleExportPDF} disabled={isExporting} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">
                      <FileText size={14} /> PDF
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block self-center"></div>
                    <button onClick={(e) => triggerEdit(selectedTicket, e)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-md border border-slate-200 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => triggerDelete(selectedTicket.id)} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-md border border-slate-200 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {isEditing && (
                  <button onClick={saveEdit} className="px-3 py-1.5 bg-[#5C67ED] hover:bg-indigo-600 text-white rounded-md font-medium text-sm flex items-center gap-1.5 shadow-sm">
                    <Save size={16} /> Save Changes
                  </button>
                )}
                <button onClick={() => { setSelectedTicket(null); setIsEditing(false); }} className="p-2 text-slate-400 hover:bg-slate-200 bg-white rounded-md border border-slate-200">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6 text-sm">
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Name</p>
                      <p className="font-semibold text-slate-800 text-base">{selectedTicket.customerName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-slate-700">{selectedTicket.phoneNumber}</p>
                        <a href={`tel:${selectedTicket.phoneNumber}`} className="text-indigo-500 hover:text-indigo-600 transition-colors p-1 bg-indigo-50 rounded-full" title="Call Customer">
                          <Phone size={14} />
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Device & Model</p>
                      <p className="text-slate-700">{selectedTicket.deviceBrand} {selectedTicket.deviceModel}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">IMEI</p>
                      <p className="text-slate-700 font-mono">{selectedTicket.imei || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Status</p>
                      <p className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        selectedTicket.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        selectedTicket.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{selectedTicket.status || 'Pending'}</p>
                    </div>
                    {selectedTicket.status === 'Return To Customer' && selectedTicket.returnedAt && (
                      <div>
                        <p className="text-[11px] font-bold text-amber-500 uppercase mb-1">Returned Date</p>
                        <p className="font-semibold text-slate-800">{new Date(selectedTicket.returnedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedTicket.status === 'Return To Customer' && selectedTicket.realCost && (
                      <div>
                        <p className="text-[11px] font-bold text-emerald-500 uppercase mb-1">Real Cost (Final Amount)</p>
                        <p className="font-semibold text-emerald-600">{selectedTicket.realCost}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Error Type</p>
                      <p className="text-slate-700">{selectedTicket.errorType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Estimated Cost</p>
                      <p className="text-slate-700">{selectedTicket.estimatedCost || '-'}</p>
                    </div>
                    {selectedTicket.advancePayment && (
                      <div>
                        <p className="text-[11px] font-bold text-emerald-500 uppercase mb-1">Advance Payment</p>
                        <p className="text-slate-700">{selectedTicket.advancePayment}</p>
                      </div>
                    )}
                    {selectedTicket.usedSparepartName && (
                      <div>
                        <p className="text-[11px] font-bold text-indigo-500 uppercase mb-1">Used Sparepart</p>
                        <p className="text-slate-700 font-medium">{selectedTicket.usedSparepartName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Screen Lock</p>
                      <p className="text-slate-700">{selectedTicket.screenLock} {selectedTicket.screenLockValue ? `(${selectedTicket.screenLockValue})` : ''}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Accessories</p>
                      <p className="text-slate-700">{selectedTicket.accessories.join(', ') || 'None'}</p>
                    </div>
                  </div>

                  {selectedTicket.notes && (
                    <div className="pb-6 border-b border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Service Notes</p>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">{selectedTicket.notes}</p>
                    </div>
                  )}

                  {selectedTicket.photos && selectedTicket.photos.length > 0 && (
                     <div>
                       <p className="text-[11px] font-bold text-slate-400 uppercase mb-3">Device Photos</p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {selectedTicket.photos.map((p, i) => (
                           <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-slate-200">
                             <img src={p} alt={`Upload ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                           </a>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                editData && (
                  <div className="space-y-5 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
                        <input type="text" name="customerName" value={editData.customerName} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                        <input type="text" name="phoneNumber" value={editData.phoneNumber} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Brand</label>
                        <input type="text" name="deviceBrand" value={editData.deviceBrand} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Model</label>
                        <input type="text" name="deviceModel" value={editData.deviceModel} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">IMEI</label>
                        <input type="text" name="imei" value={editData.imei} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Adv. Payment</label>
                        <input type="text" name="advancePayment" value={editData.advancePayment || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Est. Cost</label>
                        <input type="text" name="estimatedCost" value={editData.estimatedCost} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      {editData.status === 'Return To Customer' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Real Cost (Final Amount)</label>
                          <input type="text" name="realCost" value={editData.realCost || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Error Type</label>
                      <select name="errorType" value={editData.errorType} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                         <option value="">Select...</option>
                         {errorTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Screen Lock</label>
                        <select name="screenLock" value={editData.screenLock} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                          {['None', 'Pin', 'Password', 'Pattern'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      {editData.screenLock !== 'None' && editData.screenLock !== 'Pattern' && (
                        <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1">Lock Value</label>
                           <input type="text" name="screenLockValue" value={editData.screenLockValue || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      )}
                    </div>

                    {editData.screenLock === 'Pattern' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                           <label className="block text-xs font-semibold text-slate-500 mb-3 w-full text-center">Draw Pattern</label>
                           <div className="grid grid-cols-3 gap-3 w-fit">
                             {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                               const val = editData.screenLockValue || '';
                               const isSelected = val.includes(num.toString());
                               const orderIndex = val.indexOf(num.toString());
                               
                               return (
                                 <button
                                   key={num}
                                   type="button"
                                   onClick={() => {
                                     if (!isSelected) {
                                       setEditData(p => p ? {...p, screenLockValue: val ? val + num : num.toString()} : p);
                                     }
                                   }}
                                   className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                     isSelected ? 'bg-[#5C67ED] text-white shadow-md' : 'bg-white border border-slate-200 text-transparent hover:bg-slate-100'
                                   }`}
                                 >
                                   {isSelected ? (orderIndex + 1) : num}
                                 </button>
                               );
                             })}
                           </div>
                           {(editData.screenLockValue || '') && (
                             <button type="button" onClick={() => setEditData(p => p ? {...p, screenLockValue: ''} : p)} className="mt-3 text-[10px] uppercase font-bold text-slate-400 hover:text-red-500">
                               Clear
                             </button>
                           )}
                        </div>
                    )}

                    <div>
                       <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Accessories</label>
                       <div className="grid grid-cols-2 gap-2">
                         {['Charger', 'Memory Card', 'Battery', 'Sim Card'].map(acc => (
                           <label key={acc} className="flex items-center gap-2 text-sm">
                             <input type="checkbox" checked={!!editAccessories[acc]} onChange={() => handleAccChange(acc)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                             {acc}
                           </label>
                         ))}
                       </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                      <textarea name="notes" value={editData.notes} onChange={handleEditChange} rows={3} className="w-full p-2 border border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"></textarea>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cost Prompt Modal */}
      {promptCostTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8F9FA]">
              <h3 className="font-semibold text-slate-800">Complete Return</h3>
              <button onClick={() => setPromptCostTicket(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Real Cost (Final Amount)</label>
              <input 
                type="text" 
                value={realCostValue} 
                onChange={e => setRealCostValue(e.target.value)} 
                placeholder="Enter final cost amount" 
                className="w-full p-3 border border-slate-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                onKeyDown={e => e.key === 'Enter' && submitCostPrompt()}
                autoFocus
              />
              <div className="flex gap-3 justify-end mt-2">
                <button onClick={() => setPromptCostTicket(null)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={submitCostPrompt} className="px-4 py-2.5 text-sm font-medium text-white bg-[#5C67ED] hover:bg-indigo-600 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <Check size={16} />
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Ticket</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setTicketToDelete(null)} 
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Authentication Required</h3>
            <p className="text-slate-500 text-sm mb-4">Please enter the password to perform this action.</p>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => {
                setPasswordInput(e.target.value);
                setWrongPassword(false);
              }}
              className={`w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 transition-colors ${
                wrongPassword 
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              placeholder="Enter password..."
              autoFocus
              onKeyDown={e => e.key === 'Enter' && executePendingAction()}
            />
            {wrongPassword && <p className="text-red-500 text-xs font-semibold mb-4 text-left">Incorrect password.</p>}
            {!wrongPassword && <div className="mb-4"></div>}
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput('');
                  setWrongPassword(false);
                  setPendingActionCallback(null);
                }} 
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={executePendingAction} 
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#5C67ED] hover:bg-indigo-600 rounded-lg shadow-sm transition-colors flex-1"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print/Export View container */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, zIndex: -100, display: 'block' }}>
         {selectedTicket && <TicketReceipt ticket={selectedTicket} ref={receiptRef} />}
      </div>
    </div>
  );
};
