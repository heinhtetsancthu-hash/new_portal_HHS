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
      className="bg-[#ffffff] p-8 w-[210mm] min-h-[297mm] relative font-sans text-[#1e293b] mx-auto box-border"
      style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#1e293b' }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-widest text-[#0f172a] mb-2">
          HEIN HTET SAN
        </h1>
        <p className="text-[14px] font-semibold text-[#64748b] tracking-wider mb-4">
          MOBILE SALES & PROFESSIONAL REPAIR SERVICE
        </p>
        <div className="flex justify-center items-center gap-6 text-[14px] text-[#64748b]">
          <div className="flex items-center gap-2">
             <MapPin size={16} />
             <span>Myothit Street, Htantabin, Bago</span>
          </div>
          <div className="flex items-center gap-2">
             <Phone size={16} />
             <span>09768747313</span>
          </div>
        </div>
      </div>
      
      <div className="border-t-2 border-[#1e293b] mb-6 w-full"></div>

      {/* Customer Info & Details */}
      <div className="flex justify-between mb-8">
        <div>
           <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Customer Information</p>
           <p className="text-3xl font-bold text-[#1e293b]">{ticket.customerName}</p>
           <p className="text-[14px] text-[#64748b] mt-2">{ticket.phoneNumber}</p>
        </div>
        <div className="text-right">
           <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Receipt Details</p>
           <p className="text-2xl font-bold text-[#4338ca]">{ticket.ticketId || ticket.id.substring(0,8)}</p>
           <p className="text-[14px] text-[#64748b] mt-2">{new Date(ticket.createdAt).toISOString().split('T')[0]}</p>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0] mb-6" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div className="grid grid-cols-2 gap-y-6 gap-x-6">
           <div>
             <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Device Model</p>
             <p className="text-xl font-semibold text-[#1e293b]">{ticket.deviceBrand} {ticket.deviceModel}</p>
           </div>
           <div>
             <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">IMEI / Serial</p>
             <p className="text-[14px] font-semibold text-[#475569]">{ticket.imei || '-'}</p>
           </div>
           <div>
             <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Reported Error</p>
             <p className="text-xl font-bold text-[#dc2626]">{ticket.errorType}</p>
           </div>
           <div>
             <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Screen Lock ({ticket.screenLock})</p>
             <p className="text-[14px] font-semibold text-[#475569]">{ticket.screenLockValue || '-'}</p>
           </div>
        </div>

        <div className="mt-6">
           <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Included Accessories</p>
           <p className="text-[14px] italic text-[#64748b]">
             {ticket.accessories.length > 0 ? ticket.accessories.join(', ') : 'No accessories included'}
           </p>
        </div>

        <div className="mt-6">
           <p className="text-[14px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Service Faults / Note</p>
           <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4 text-[14px] text-[#334155] min-h-[60px]" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
             {ticket.notes || '-'}
           </div>
        </div>
      </div>

      {/* Cost */}
      <div className="flex flex-col gap-2 mb-6 px-4">
        {ticket.advancePayment && (
          <div className="flex justify-between items-end">
            <p className="text-[14px] font-bold text-[#64748b] uppercase tracking-wider">Advance Payment</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#10b981]">{ticket.advancePayment}</span>
              <span className="text-[14px] font-bold text-[#10b981]">MMK</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-end">
           <p className="text-[14px] font-bold text-[#64748b] uppercase tracking-wider">Repair Cost</p>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-bold text-[#4338ca]">{cost || '0'}</span>
             <span className="text-[14px] font-bold text-[#4338ca]">MMK</span>
           </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-6 relative" style={{ backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
         <div className="flex items-start gap-2 mb-2">
            <Info size={16} className="text-[#854d0e] mt-0.5" />
            <p className="text-[14px] font-bold text-[#854d0e]">Terms & Conditions:</p>
         </div>
         <div className="text-[14px] text-[#713f12] whitespace-pre-wrap leading-relaxed pl-6 font-medium">
            {terms}
         </div>
      </div>
    </div>
  );
});

TicketReceipt.displayName = 'TicketReceipt';
