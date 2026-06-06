import React, { useEffect, useState } from 'react';
import { SaleItem } from '../types';
import { MapPin, Phone, Info } from 'lucide-react';
import { getStoredSaleTerms, subscribeStoredSaleTerms } from './Settings';

interface SaleReceiptProps {
  sale: SaleItem;
}

export const SaleReceipt = React.forwardRef<HTMLDivElement, SaleReceiptProps>(({ sale }, ref) => {
  const [terms, setTerms] = useState<string>('');
  
  useEffect(() => {
    const unsub = subscribeStoredSaleTerms(setTerms);
    return () => unsub();
  }, []);

  return (
    <div 
      ref={ref}
      className="bg-[#ffffff] p-8 w-[148mm] min-h-[210mm] relative font-sans text-[#1e293b] mx-auto box-border"
      style={{ width: '148mm', minHeight: '210mm', backgroundColor: '#ffffff', color: '#1e293b' }}
    >
      {/* Header */}
      <div className="text-center mb-6">
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
      
      <div className="border-t-2 border-[#1e293b] mb-6 w-full"></div>

      {/* Customer Info & Details */}
      <div className="flex justify-between mb-8">
        <div>
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Customer Information</p>
           <p className="text-xl font-bold text-[#1e293b] capitalize">{sale.customerName}</p>
           <p className="text-xs text-[#64748b] mt-1">{sale.phoneNumber}</p>
           {sale.address && <p className="text-xs text-[#64748b] mt-0.5 break-words max-w-[200px]">{sale.address}</p>}
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Receipt Details</p>
           <p className="text-lg font-bold text-[#4338ca]">{sale.id.substring(0,12)}</p>
           <p className="text-xs text-[#64748b] mt-1">{new Date(sale.soldAt).toISOString().split('T')[0]}</p>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 mb-8">
         <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
               <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Device Model</p>
               <p className="text-[#1e293b] font-medium text-lg">{sale.brand} {sale.model}</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">IMEI / SERIAL</p>
               <p className="text-[#1e293b] font-medium text-sm">{sale.imei}</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">RAM / ROM</p>
               <p className="text-[#1e293b] font-medium text-sm">{sale.ramRom || 'N/A'}</p>
            </div>
            <div>
               <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Color</p>
               <p className="text-[#1e293b] font-medium text-sm">{sale.color || 'N/A'}</p>
            </div>
         </div>
         
         <div className="border-t border-[#e2e8f0] pt-6 flex justify-between items-end">
             <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total AMOUNT</p>
             <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-[#4338ca] leading-none">{sale.price ? sale.price.toLocaleString() : '0'}</span>
                <span className="text-xs font-bold text-[#4338ca] mb-1">MMK</span>
             </div>
         </div>
      </div>

      {/* Terms & Conditions */}
      {terms && (
        <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-5 mb-4">
           <div className="flex items-start gap-2">
              <Info size={14} className="text-[#854d0e] mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-[#854d0e] leading-relaxed whitespace-pre-wrap">
                {terms}
              </p>
           </div>
        </div>
      )}
    </div>
  );
});
