import React, { useEffect, useState } from 'react';
import { Ticket } from '../types';
import { getStoredTerms, subscribeStoredTerms } from './Settings';
import { MapPin, Phone, Info } from 'lucide-react';

interface TicketReceiptProps {
  ticket: Ticket;
}

export const TicketReceipt = React.forwardRef<HTMLDivElement, TicketReceiptProps>(({ ticket }, ref) => {
  const [terms, setTerms] = useState<string>('');
  
  useEffect(() => {
    const unsub = subscribeStoredTerms(setTerms);
    return () => unsub();
  }, []);

  const cost = ticket.status === 'Return To Customer' && ticket.realCost ? ticket.realCost : ticket.estimatedCost;

  return (
    <div 
      ref={ref}
      className="bg-[#ffffff] p-4 w-[148mm] min-h-[210mm] relative font-sans text-[#1e293b] mx-auto box-border"
      style={{ width: '148mm', minHeight: '210mm', backgroundColor: '#ffffff', color: '#1e293b' }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-widest text-[#0f172a] mb-1">
          HEIN HTET SAN
        </h1>
        <p className="text-xs font-semibold text-[#64748b] tracking-wider mb-2">
          MOBILE SALES & PROFESSIONAL REPAIR SERVICE
        </p>
        <div className="flex justify-center items-center gap-4 text-[10px] text-[#64748b]">
          <div className="flex items-center gap-1">
             <MapPin size={12} />
             <span>Myothit Street, Htantabin, Bago</span>
          </div>
          <div className="flex items-center gap-1">
             <Phone size={12} />
             <span>09768747313</span>
          </div>
        </div>
      </div>
      
      <div className="border-t-2 border-[#1e293b] mb-2 w-full"></div>

      {/* Customer Info & Details */}
      <div className="flex justify-between mb-3">
        <div>
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Customer Information</p>
           <p className="text-xl font-bold text-[#1e293b]">{ticket.customerName}</p>
           <p className="text-xs text-[#64748b] mt-1">{ticket.phoneNumber}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Receipt Details</p>
           <p className="text-lg font-bold text-[#4338ca]">{ticket.ticketId || ticket.id.substring(0,8)}</p>
           <p className="text-xs text-[#64748b] mt-1">{new Date(ticket.createdAt).toISOString().split('T')[0]}</p>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] mb-3" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div className="grid grid-cols-2 gap-y-2 gap-x-2">
           <div>
             <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Device Model</p>
             <p className="text-base font-semibold text-[#1e293b]">{ticket.deviceBrand} {ticket.deviceModel}</p>
           </div>
           <div>
             <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">IMEI / Serial</p>
             <p className="text-sm font-semibold text-[#475569]">{ticket.imei || '-'}</p>
           </div>
           <div>
             <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Reported Error</p>
             <p className="text-base font-bold text-[#dc2626]">{ticket.errorType}</p>
           </div>
           <div>
             <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Screen Lock ({ticket.screenLock})</p>
             <p className="text-sm font-semibold text-[#475569]">{ticket.screenLockValue || '-'}</p>
           </div>
        </div>

        <div className="mt-2">
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Included Accessories</p>
           <p className="text-sm italic text-[#64748b]">
             {ticket.accessories.length > 0 ? ticket.accessories.join(', ') : 'No accessories included'}
           </p>
        </div>

        <div className="mt-2">
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Service Faults / Note</p>
           <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-2 text-sm text-[#334155] min-h-[40px]" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
             {ticket.notes || '-'}
           </div>
        </div>
      </div>

      {/* Cost */}
      <div className="flex justify-between items-end mb-3 px-2">
         <p className="text-sm font-bold text-[#64748b] uppercase tracking-wider">Repair Cost</p>
         <div className="flex items-baseline gap-2">
           <span className="text-3xl font-bold text-[#4338ca]">{cost || '0'}</span>
           <span className="text-sm font-bold text-[#4338ca]">MMK</span>
         </div>
      </div>

      {/* Terms */}
      <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-3 relative" style={{ backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
         <div className="flex items-start gap-1 mb-1">
            <Info size={14} className="text-[#854d0e] mt-0.5" />
            <p className="text-xs font-bold text-[#854d0e]">Terms & Conditions:</p>
         </div>
         <div className="text-[10px] text-[#713f12] whitespace-pre-wrap leading-none pl-5 font-medium">
            {terms}
         </div>
      </div>
    </div>
  );
});

TicketReceipt.displayName = 'TicketReceipt';
