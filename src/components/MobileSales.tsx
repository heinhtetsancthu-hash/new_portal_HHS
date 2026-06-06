import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, PackagePlus, ShoppingBag, CreditCard, Smartphone, Plus, Trash2, Check, RefreshCw, List, Eye, Edit, X, Download, Search, LayoutDashboard } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { saveStockItem, getStockItems, deleteStockItem, saveSaleItem, getSaleItems, deleteSaleItem, saveInstallmentSaleItem, getInstallmentSaleItems, deleteInstallmentSaleItem } from '../db';
import { StockItem, SaleItem, InstallmentSaleItem } from '../types';
import { SaleReceipt } from './SaleReceipt';

interface MobileSalesProps {
  onBack: () => void;
}

export const MobileSales: React.FC<MobileSalesProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'addStock' | 'sales' | 'installment' | 'stockList' | 'overview'>('addStock');
  const [activeSalesTab, setActiveSalesTab] = useState<'sale' | 'saleList'>('sale');
  const [activeInstallmentTab, setActiveInstallmentTab] = useState<'sale' | 'list'>('sale');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [installmentSaleItems, setInstallmentSaleItems] = useState<InstallmentSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingInstallments, setLoadingInstallments] = useState(true);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [ramRom, setRamRom] = useState('');
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [viewingItem, setViewingItem] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [viewingSale, setViewingSale] = useState<SaleItem | null>(null);
  const [editingSale, setEditingSale] = useState<SaleItem | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [deletingInstSaleId, setDeletingInstSaleId] = useState<string | null>(null);

  const [viewingInstSale, setViewingInstSale] = useState<InstallmentSaleItem | null>(null);
  const [editingInstSale, setEditingInstSale] = useState<InstallmentSaleItem | null>(null);

  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [salePhoneNumber, setSalePhoneNumber] = useState('');
  const [saleAddress, setSaleAddress] = useState('');
  const [selectedStockId, setSelectedStockId] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);
  const [saleSearchTerm, setSaleSearchTerm] = useState('');

  const [instCustomerName, setInstCustomerName] = useState('');
  const [instPhoneNumber, setInstPhoneNumber] = useState('');
  const [instAddress, setInstAddress] = useState('');
  const [instSelectedStockId, setInstSelectedStockId] = useState('');
  const [instMonths, setInstMonths] = useState<number>(6);
  const [instInterest, setInstInterest] = useState<number | ''>(0);
  const [instDocFees, setInstDocFees] = useState<number | ''>(5000);
  const [instDownPayment, setInstDownPayment] = useState<number | ''>(0);
  const [instMonthlyPayments, setInstMonthlyPayments] = useState<number[]>([]);
  const [isInstSelling, setIsInstSelling] = useState(false);
  const [hideZeroBalance, setHideZeroBalance] = useState(false);
  const [showCompleteCustomer, setShowCompleteCustomer] = useState(false);

  useEffect(() => {
    const stockItem = stockItems.find(item => item.id === instSelectedStockId || item.imei === instSelectedStockId);
    if (stockItem && stockItem.price) {
      const price = stockItem.price;
      const calcInterest = price * 0.10;
      setInstInterest(calcInterest);
    } else {
      setInstInterest(0);
    }
  }, [instSelectedStockId, stockItems]);

  const instPrice = stockItems.find(item => item.id === instSelectedStockId || item.imei === instSelectedStockId)?.price || 0;
  const currentInstInterest = typeof instInterest === 'number' ? instInterest : 0;
  const currentInstDocFees = typeof instDocFees === 'number' ? instDocFees : 0;
  const currentInstDownPayment = typeof instDownPayment === 'number' ? instDownPayment : 0;
  const instGrandTotal = instPrice + currentInstInterest + currentInstDocFees;

  useEffect(() => {
    if (instGrandTotal > 0) {
      setInstDownPayment(instGrandTotal * 0.35);
    } else {
      setInstDownPayment(0);
    }
  }, [instGrandTotal]);

  useEffect(() => {
    const remainingToPay = instGrandTotal - currentInstDownPayment;
    const defaultMonthly = Math.round(remainingToPay / instMonths);
    const payments = Array(instMonths).fill(defaultMonthly);
    
    if (instMonths > 0) {
      payments[instMonths - 1] = remainingToPay - (defaultMonthly * (instMonths - 1));
    }
    setInstMonthlyPayments(payments);
  }, [instGrandTotal, currentInstDownPayment, instMonths]);

  const totalMonthlyPayments = instMonthlyPayments.reduce((acc, curr) => acc + curr, 0);
  const instRemainBalance = instGrandTotal - currentInstDownPayment - totalMonthlyPayments;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadingSales(true);
    setLoadingInstallments(true);
    try {
      const items = await getStockItems();
      setStockItems(items);
      const sales = await getSaleItems();
      setSaleItems(sales);
      const installmentSales = await getInstallmentSaleItems();
      setInstallmentSaleItems(installmentSales);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
      setLoadingSales(false);
      setLoadingInstallments(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !imei) return;

    const parsedPrice = parseFloat(price);
    const validPrice = isNaN(parsedPrice) ? 0 : parsedPrice;

    setIsSubmitting(true);
    const newItem: StockItem = {
      id: Date.now().toString(),
      brand,
      model,
      ramRom,
      imei,
      color,
      price: validPrice,
      createdAt: Date.now(),
    };

    try {
      await saveStockItem(newItem);
      setStockItems([newItem, ...stockItems]);
      setSubmitSuccess(true);
      
      // Reset form
      setBrand('');
      setModel('');
      setRamRom('');
      setImei('');
      setColor('');
      setPrice('');
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('stockList');
      }, 1000);
    } catch (error) {
      console.error('Error saving stock', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = (id: string) => {
    setDeletingId(id);
    setDeletingSaleId(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteSale = (id: string) => {
    setDeletingSaleId(id);
    setDeletingId(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (deletePassword !== '1471656') {
      setDeleteError('Incorrect password');
      return;
    }
    
    if (deletingId) {
      try {
        await deleteStockItem(deletingId);
        setStockItems(stockItems.filter(item => item.id !== deletingId));
        setDeletingId(null);
        setDeletePassword('');
        setDeleteError('');
      } catch (error) {
        console.error('Error deleting stock', error);
      }
    } else if (deletingSaleId) {
      try {
        const saleItemToRestore = saleItems.find(item => item.id === deletingSaleId);
        if (saleItemToRestore) {
          const restoredStockItem: StockItem = {
            id: saleItemToRestore.stockId,
            brand: saleItemToRestore.brand,
            model: saleItemToRestore.model,
            ramRom: saleItemToRestore.ramRom,
            imei: saleItemToRestore.imei,
            color: saleItemToRestore.color,
            price: saleItemToRestore.price,
            createdAt: Date.now(),
          };
          await saveStockItem(restoredStockItem);
          setStockItems([restoredStockItem, ...stockItems]);
        }

        await deleteSaleItem(deletingSaleId);
        setSaleItems(saleItems.filter(item => item.id !== deletingSaleId));
        setDeletingSaleId(null);
        setDeletePassword('');
        setDeleteError('');
      } catch (error) {
        console.error('Error deleting sale', error);
      }
    } else if (deletingInstSaleId) {
      try {
        const instSaleItemToRestore = installmentSaleItems.find(item => item.id === deletingInstSaleId);
        if (instSaleItemToRestore) {
          const restoredStockItem: StockItem = {
            id: instSaleItemToRestore.stockId,
            brand: instSaleItemToRestore.brand,
            model: instSaleItemToRestore.model,
            ramRom: instSaleItemToRestore.ramRom,
            imei: instSaleItemToRestore.imei,
            color: instSaleItemToRestore.color,
            price: instSaleItemToRestore.price,
            createdAt: Date.now(),
          };
          await saveStockItem(restoredStockItem);
          setStockItems([restoredStockItem, ...stockItems]);
        }

        await deleteInstallmentSaleItem(deletingInstSaleId);
        setInstallmentSaleItems(installmentSaleItems.filter(item => item.id !== deletingInstSaleId));
        setDeletingInstSaleId(null);
        setDeletePassword('');
        setDeleteError('');
      } catch (error) {
        console.error('Error deleting installment sale', error);
      }
    }
  };

  const handleEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      await saveStockItem(editingItem);
      setStockItems(stockItems.map(item => item.id === editingItem.id ? editingItem : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating stock', error);
    }
  };

  const handleEditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    
    try {
      await saveSaleItem(editingSale);
      setSaleItems(saleItems.map(item => item.id === editingSale.id ? editingSale : item));
      setEditingSale(null);
    } catch (error) {
      console.error('Error updating sale', error);
    }
  };

  const handleEditInstSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstSale) return;
    
    try {
      await saveInstallmentSaleItem(editingInstSale);
      setInstallmentSaleItems(installmentSaleItems.map(item => item.id === editingInstSale.id ? editingInstSale : item));
      setEditingInstSale(null);
    } catch (error) {
      console.error('Error updating installment sale', error);
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const instPdfRef = useRef<HTMLDivElement>(null);
  const [isExportingInst, setIsExportingInst] = useState(false);

  const handleExportInstPDF = async () => {
    if (!instPdfRef.current || !viewingInstSale) return;
    setIsExportingInst(true);
    try {
      const imgData = await toPng(instPdfRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (instPdfRef.current.offsetHeight * pdfWidth) / instPdfRef.current.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${viewingInstSale.customerName}_${viewingInstSale.model}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF', e);
    } finally {
      setIsExportingInst(false);
    }
  };

  const handleExportPDF = async () => {
    if (!receiptRef.current || !viewingSale) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(receiptRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a5');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${viewingSale.customerName}_Receipt.pdf`);
    } catch (e) {
      console.error('Failed to export PDF', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSellStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCustomerName || !salePhoneNumber || !selectedStockId) return;

    const stockItem = stockItems.find(item => item.id === selectedStockId || item.imei === selectedStockId);
    if (!stockItem) return;

    setIsSelling(true);

    const newSale: SaleItem = {
      id: Date.now().toString(),
      customerName: saleCustomerName,
      phoneNumber: salePhoneNumber,
      address: saleAddress,
      stockId: stockItem.id,
      brand: stockItem.brand,
      model: stockItem.model,
      ramRom: stockItem.ramRom,
      imei: stockItem.imei,
      color: stockItem.color,
      price: stockItem.price,
      soldAt: Date.now(),
    };

    try {
      await saveSaleItem(newSale);
      await deleteStockItem(stockItem.id);
      
      setSaleItems([newSale, ...saleItems]);
      setStockItems(stockItems.filter(item => item.id !== stockItem.id));
      
      setSellSuccess(true);
      
      setSaleCustomerName('');
      setSalePhoneNumber('');
      setSaleAddress('');
      setSelectedStockId('');
      
      setTimeout(() => {
        setSellSuccess(false);
        setActiveSalesTab('saleList');
      }, 1000);
    } catch (error) {
      console.error('Error recording sale', error);
    } finally {
      setIsSelling(false);
    }
  };

  const handleInstallmentSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instCustomerName || !instPhoneNumber || !instSelectedStockId) return;

    const stockItem = stockItems.find(item => item.id === instSelectedStockId || item.imei === instSelectedStockId);
    if (!stockItem) return;

    setIsInstSelling(true);

    const newInstSale: InstallmentSaleItem = {
      id: Date.now().toString(),
      customerName: instCustomerName,
      phoneNumber: instPhoneNumber,
      address: instAddress,
      stockId: stockItem.id,
      brand: stockItem.brand,
      model: stockItem.model,
      ramRom: stockItem.ramRom,
      imei: stockItem.imei,
      color: stockItem.color,
      price: stockItem.price || 0,
      interest: currentInstInterest,
      docFees: currentInstDocFees,
      downPayment: currentInstDownPayment,
      months: instMonths,
      monthlyPayments: instMonthlyPayments,
      grandTotal: instGrandTotal,
      remainBalance: instRemainBalance,
      soldAt: Date.now(),
    };

    try {
      await saveInstallmentSaleItem(newInstSale);
      await deleteStockItem(stockItem.id);
      
      setInstallmentSaleItems([newInstSale, ...installmentSaleItems]);
      setStockItems(stockItems.filter(item => item.id !== stockItem.id));
      
      setSellSuccess(true);
      
      setInstCustomerName('');
      setInstPhoneNumber('');
      setInstAddress('');
      setInstSelectedStockId('');
      
      setTimeout(() => {
        setSellSuccess(false);
        setActiveInstallmentTab('list');
      }, 1000);
    } catch (error) {
      console.error('Error recording installment sale', error);
    } finally {
      setIsInstSelling(false);
    }
  };

  const filteredSaleItems = saleItems.filter(item => {
    const searchLower = saleSearchTerm.toLowerCase();
    return (
      item.customerName?.toLowerCase().includes(searchLower) ||
      item.phoneNumber?.toLowerCase().includes(searchLower) ||
      item.imei?.toLowerCase().includes(searchLower) ||
      item.id?.toLowerCase().includes(searchLower)
    );
  });

  const filteredInstallments = installmentSaleItems.filter(item => {
    if (hideZeroBalance && (item.remainBalance || 0) <= 0) return false;
    if (showCompleteCustomer && (item.remainBalance || 0) > 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 p-2 px-3 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 font-medium text-sm border border-slate-200 shadow-sm mr-2"
          title="Back to Home"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
          <Smartphone size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mobile Sales</h1>
          <p className="text-xs font-medium text-sky-600 tracking-wider">STORE MANAGEMENT</p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('addStock')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'addStock' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PackagePlus size={18} />
            Add Stock
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sales' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag size={18} />
            Cash Sale
          </button>
          <button
            onClick={() => setActiveTab('installment')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'installment' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard size={18} />
            Installment
          </button>
          <button
            onClick={() => setActiveTab('stockList')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stockList' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List size={18} />
            Stock List
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border border-slate-100 md:p-6 min-h-[400px]">
          {activeTab === 'addStock' && (
            <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:border-none md:shadow-none md:p-0">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <PackagePlus size={20} className="text-sky-600" />
                  New Stock Entry
                </h2>
                
                <form onSubmit={handleAddStock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                      placeholder="e.g. Apple, Samsung"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                      placeholder="e.g. iPhone 15 Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ram/Rom</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={ramRom}
                      onChange={(e) => setRamRom(e.target.value)}
                      placeholder="e.g. 8GB/256GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      required
                      placeholder="Enter 15-digit IMEI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Titanium Blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1500000"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors mt-6 ${
                      submitSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    {isSubmitting ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : submitSuccess ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    {isSubmitting ? 'Saving...' : submitSuccess ? 'Saved Successfully!' : 'Add to Stock'}
                  </button>
                </form>
              </div>
          )}

          {activeTab === 'stockList' && (
              <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:border-none md:shadow-none md:p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Stock List</h2>
                  <div className="flex gap-2">
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-sky-500 font-normal">Value:</span> 
                      {stockItems.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-emerald-500 font-normal">Devices:</span>
                      {stockItems.length}
                    </span>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="animate-spin text-slate-400" size={24} />
                  </div>
                ) : stockItems.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-xl">
                    <PackagePlus className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-800">No stock available</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by adding a new device above.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Model details</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">IMEI</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Specifics</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Price</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {stockItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">{item.brand} {item.model}</div>
                              <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                              {item.imei}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {item.ramRom && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{item.ramRom}</span>}
                                {item.color && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{item.color}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800">
                              {item.price ? item.price.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setViewingItem(item)}
                                  className="text-slate-400 hover:text-sky-500 transition-colors p-1"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => setEditingItem(item)}
                                  className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteStock(item.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
          )}
          
          {activeTab === 'overview' && (
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:border-none md:shadow-none md:p-0">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <LayoutDashboard size={20} className="text-sky-600" />
                Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-sky-100 rounded-lg text-sky-600">
                      <List size={24} />
                    </div>
                    <div>
                      <h3 className="text-slate-600 font-medium">Stock Value</h3>
                      <p className="text-2xl font-bold text-slate-800">{stockItems.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">MMK</span></p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 text-sm flex justify-between items-center text-slate-600">
                    <span>Total Devices</span>
                    <span className="font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">{stockItems.length}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="text-slate-600 font-medium">Installment Remaining Total</h3>
                      <p className="text-2xl font-bold text-slate-800">{installmentSaleItems.reduce((acc, item) => acc + (item.remainBalance || 0), 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">MMK</span></p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 text-sm flex justify-between items-center text-slate-600">
                    <span>Active Installment Devices</span>
                    <span className="font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">{installmentSaleItems.filter(item => (item.remainBalance || 0) > 0).length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:border-none md:shadow-none md:p-0">
              <div className="flex space-x-6 border-b border-slate-200 mb-6 px-2">
                <button
                  onClick={() => setActiveSalesTab('sale')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSalesTab === 'sale'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Sale
                </button>
                <button
                  onClick={() => setActiveSalesTab('saleList')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSalesTab === 'saleList'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Sale List
                </button>
              </div>

              {activeSalesTab === 'sale' && (
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-sky-600" />
                    New Cash Sale
                  </h3>
                  
                  <form onSubmit={handleSellStock} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={saleCustomerName}
                          onChange={(e) => setSaleCustomerName(e.target.value)}
                          required
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={salePhoneNumber}
                          onChange={(e) => setSalePhoneNumber(e.target.value)}
                          required
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                      <textarea
                        className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                        value={saleAddress}
                        onChange={(e) => setSaleAddress(e.target.value)}
                        required
                        placeholder="Enter customer address"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Device (IMEI)</label>
                      <input
                        list="stock-devices-sale"
                        className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                        value={selectedStockId}
                        onChange={(e) => setSelectedStockId(e.target.value)}
                        placeholder="Enter IMEI or select from list"
                        required
                      />
                      <datalist id="stock-devices-sale">
                        {stockItems.map(item => (
                          <option key={item.id} value={item.imei}>
                            {item.brand} {item.model}
                          </option>
                        ))}
                      </datalist>
                    </div>

                    {selectedStockId && stockItems.find(i => i.id === selectedStockId || i.imei === selectedStockId) && (() => {
                      const item = stockItems.find(i => i.id === selectedStockId || i.imei === selectedStockId)!;
                      return (
                        <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-sky-800 mb-2">Device Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between border-b border-sky-100/50 pb-1">
                              <span className="text-sky-600">Brand</span>
                              <span className="font-medium text-slate-800">{item.brand}</span>
                            </div>
                            <div className="flex justify-between border-b border-sky-100/50 pb-1">
                              <span className="text-sky-600">Model</span>
                              <span className="font-medium text-slate-800">{item.model}</span>
                            </div>
                            <div className="flex justify-between border-b border-sky-100/50 pb-1">
                              <span className="text-sky-600">Ram/Rom</span>
                              <span className="font-medium text-slate-800">{item.ramRom || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-sky-100/50 pb-1">
                              <span className="text-sky-600">Color</span>
                              <span className="font-medium text-slate-800">{item.color || '-'}</span>
                            </div>
                            <div className="flex justify-between col-span-2 pt-1 border-t border-sky-200 mt-1">
                              <span className="text-sky-700 font-semibold">Price</span>
                              <span className="font-bold text-sky-700">{item.price ? item.price.toLocaleString() : '-'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <button
                      type="submit"
                      disabled={isSelling || !selectedStockId}
                      className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors mt-6 ${
                        sellSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSelling ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : sellSuccess ? (
                        <Check size={18} />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                      {isSelling ? 'Processing...' : sellSuccess ? 'Sold Successfully!' : 'Confirm Sale'}
                    </button>
                  </form>
                </div>
              )}

              {activeSalesTab === 'saleList' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <List size={20} className="text-sky-600" />
                      Cash Sale List
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search name, phone, IMEI..."
                          value={saleSearchTerm}
                          onChange={(e) => setSaleSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <span className="text-sky-500 font-normal">Revenue:</span> 
                          {filteredSaleItems.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <span className="text-emerald-500 font-normal">Sales:</span>
                          {filteredSaleItems.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {loadingSales ? (
                    <div className="flex justify-center items-center py-12">
                      <RefreshCw className="animate-spin text-slate-400" size={24} />
                    </div>
                  ) : filteredSaleItems.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-xl">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
                      <h3 className="mt-2 text-sm font-semibold text-slate-800">{saleItems.length === 0 ? 'No sales yet' : 'No sales found'}</h3>
                      <p className="mt-1 text-sm text-slate-500">{saleItems.length === 0 ? 'Sales made will appear here.' : 'Try adjusting your search query.'}</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Customer</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Device</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Price</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredSaleItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                                {new Date(item.soldAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{item.customerName}</div>
                                <div className="text-xs text-slate-500">{item.phoneNumber}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{item.brand} {item.model}</div>
                                <div className="text-xs text-slate-500">IMEI: {item.imei}</div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                {item.price ? item.price.toLocaleString() : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setViewingSale(item)}
                                    className="text-slate-400 hover:text-sky-500 transition-colors p-1"
                                    title="View Sale"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingSale(item)}
                                    className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                    title="Edit Sale"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSale(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Sale"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'installment' && (
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:border-none md:shadow-none md:p-0">
              <div className="flex space-x-6 border-b border-slate-200 mb-6 px-2">
                <button
                  onClick={() => setActiveInstallmentTab('sale')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeInstallmentTab === 'sale'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Installment Sales
                </button>
                <button
                  onClick={() => setActiveInstallmentTab('list')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeInstallmentTab === 'list'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Installment List
                </button>
              </div>

              {activeInstallmentTab === 'sale' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-sky-600" />
                    New Installment Sale
                  </h2>
                  
                  <form className="space-y-6 max-w-2xl" onSubmit={handleInstallmentSale}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={instCustomerName}
                          onChange={(e) => setInstCustomerName(e.target.value)}
                          required
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={instPhoneNumber}
                          onChange={(e) => setInstPhoneNumber(e.target.value)}
                          required
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={instAddress}
                          onChange={(e) => setInstAddress(e.target.value)}
                          required
                          placeholder="Enter customer address"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Device (IMEI)</label>
                        <input
                          list="stock-devices-inst"
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={instSelectedStockId}
                          onChange={(e) => setInstSelectedStockId(e.target.value)}
                          placeholder="Enter IMEI or select from list"
                          required
                        />
                        <datalist id="stock-devices-inst">
                          {stockItems.map((item) => (
                            <option key={item.id} value={item.imei}>
                              {item.brand} {item.model}
                            </option>
                          ))}
                        </datalist>
                      </div>

                      {instSelectedStockId && stockItems.find(i => i.id === instSelectedStockId || i.imei === instSelectedStockId) && (() => {
                        const item = stockItems.find(i => i.id === instSelectedStockId || i.imei === instSelectedStockId)!;
                        return (
                          <div className="md:col-span-2 bg-sky-50 p-4 rounded-xl border border-sky-100 space-y-2">
                            <h4 className="text-sm font-semibold text-sky-800 mb-2">Device Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                              <div className="flex flex-col">
                                <span className="text-sky-600/70 text-xs">Brand</span>
                                <span className="font-medium text-sky-900">{item.brand}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sky-600/70 text-xs">Model</span>
                                <span className="font-medium text-sky-900">{item.model}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sky-600/70 text-xs">RAM/ROM</span>
                                <span className="font-medium text-sky-900">{item.ramRom || '-'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sky-600/70 text-xs">Color</span>
                                <span className="font-medium text-sky-900">{item.color || '-'}</span>
                              </div>
                              <div className="flex flex-col sm:col-span-2">
                                <span className="text-sky-600/70 text-xs">Price</span>
                                <span className="font-semibold text-sky-900 text-base">{item.price ? item.price.toLocaleString() : '-'} MMK</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Installment Month</label>
                        <select
                          className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 border bg-slate-50"
                          value={instMonths}
                          onChange={(e) => setInstMonths(Number(e.target.value))}
                        >
                          {Array.from({ length: 11 }, (_, i) => i + 2).map(m => (
                            <option key={m} value={m}>{m} Months</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Interest (10% default)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 pr-12 border bg-slate-50"
                            value={instInterest}
                            onChange={(e) => setInstInterest(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-400 text-sm">MMK</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Document Fees
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 pr-12 border bg-slate-50"
                            value={instDocFees}
                            onChange={(e) => setInstDocFees(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="5000"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-400 text-sm">MMK</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Down Payment (35% default)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-3 pr-12 border bg-slate-50"
                            value={instDownPayment}
                            onChange={(e) => setInstDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-400 text-sm">MMK</span>
                          </div>
                        </div>
                      </div>

                      {instMonthlyPayments.length > 0 && (
                        <div className="md:col-span-2 mt-2">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Monthly Payments</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {instMonthlyPayments.map((payment, idx) => (
                              <div key={idx}>
                                <label className="block text-xs text-slate-500 mb-1">{idx + 1} Month</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    className="w-full rounded-xl border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 pr-12 border bg-white text-sm"
                                    value={payment}
                                    onChange={(e) => {
                                      const newVal = e.target.value === '' ? 0 : Number(e.target.value);
                                      const newArr = [...instMonthlyPayments];
                                      newArr[idx] = newVal;
                                      setInstMonthlyPayments(newArr);
                                    }}
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <span className="text-slate-400 text-xs">MMK</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-600 text-sm">Device Price:</span>
                         <span className="font-medium text-slate-800">{instPrice.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-600 text-sm">Interest:</span>
                         <span className="font-medium text-slate-800">{currentInstInterest.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-600 text-sm">Document Fees:</span>
                         <span className="font-medium text-slate-800">{currentInstDocFees.toLocaleString()} MMK</span>
                      </div>
                      <div className="border-t border-slate-300 my-2 pt-2 flex justify-between items-center">
                         <span className="text-slate-800 font-semibold text-lg">Grand Total:</span>
                         <span className="font-bold text-sky-700 text-xl">{instGrandTotal.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 mb-2">
                         <span className="text-slate-600 text-sm">Monthly Payments Total:</span>
                         <span className="font-medium text-slate-800">{totalMonthlyPayments.toLocaleString()} MMK</span>
                      </div>
                      <div className="border-t border-slate-300 my-2 pt-2 flex justify-between items-center">
                         <span className="text-slate-800 font-semibold text-lg">Remain Balance:</span>
                         <span className={`font-bold text-xl ${instRemainBalance === 0 ? 'text-emerald-600' : instRemainBalance < 0 ? 'text-red-500' : 'text-orange-600'}`}>
                           {instRemainBalance.toLocaleString()} MMK
                         </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!instSelectedStockId || !instCustomerName || !instPhoneNumber}
                      className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Confirm Installment Sale
                    </button>
                  </form>
                </div>
              )}

              {activeInstallmentTab === 'list' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <List size={20} className="text-sky-600" />
                      Installment Sale List
                    </h3>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                        <input 
                          type="checkbox" 
                          checked={showCompleteCustomer} 
                          onChange={(e) => setShowCompleteCustomer(e.target.checked)}
                          className="rounded text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                        />
                        CompleteCustomer
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                        <input 
                          type="checkbox" 
                          checked={hideZeroBalance} 
                          onChange={(e) => setHideZeroBalance(e.target.checked)}
                          className="rounded text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
                        />
                        Hide RemainBalance0
                      </label>
                      <span className="bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span className="text-orange-500 font-normal">Remaining:</span>
                        {installmentSaleItems.reduce((acc, item) => acc + (item.remainBalance || 0), 0).toLocaleString()}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <span className="text-emerald-500 font-normal">Active Installs:</span>
                        {installmentSaleItems.filter(item => (item.remainBalance || 0) > 0).length}
                      </span>
                    </div>
                  </div>

                  {loadingInstallments ? (
                    <div className="flex justify-center items-center py-12">
                      <RefreshCw className="animate-spin text-slate-400" size={24} />
                    </div>
                  ) : filteredInstallments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-xl">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
                      <h3 className="mt-2 text-sm font-semibold text-slate-800">No installments yet</h3>
                      <p className="mt-1 text-sm text-slate-500">Installment sales made will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Customer</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-800 whitespace-nowrap">Device</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Grand Total</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Remain Balance</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredInstallments.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                                {new Date(item.soldAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{item.customerName}</div>
                                <div className="text-xs text-slate-500">{item.phoneNumber}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{item.brand} {item.model}</div>
                                <div className="text-xs text-slate-500">Months: {item.months}</div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                {item.grandTotal ? item.grandTotal.toLocaleString() : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-orange-600">
                                {item.remainBalance ? item.remainBalance.toLocaleString() : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setViewingInstSale(item)} className="text-slate-400 hover:text-sky-500 transition-colors p-1" title="View Installment Details">
                                    <Eye size={16} />
                                  </button>
                                  <button onClick={() => setEditingInstSale({...item})} className="text-slate-400 hover:text-amber-500 transition-colors p-1" title="Edit Installment">
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setDeletingInstSaleId(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Installment"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Stock Details</h3>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between pb-2 border-b border-slate-50 border-dashed">
                <span className="text-slate-500 text-sm">Brand</span>
                <span className="font-medium text-slate-800">{viewingItem.brand}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50 border-dashed">
                <span className="text-slate-500 text-sm">Model</span>
                <span className="font-medium text-slate-800">{viewingItem.model}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50 border-dashed">
                <span className="text-slate-500 text-sm">Ram/Rom</span>
                <span className="font-medium text-slate-800">{viewingItem.ramRom || '-'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50 border-dashed">
                <span className="text-slate-500 text-sm">IMEI</span>
                <span className="font-medium text-slate-800">{viewingItem.imei}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50 border-dashed">
                <span className="text-slate-500 text-sm">Color</span>
                <span className="font-medium text-slate-800">{viewingItem.color || '-'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500 text-sm">Price</span>
                <span className="font-medium text-sky-600">{viewingItem.price ? viewingItem.price.toLocaleString() : '-'}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-slate-800">Edit Stock Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <form id="edit-form" onSubmit={handleEditStock} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.brand}
                    onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.model}
                    onChange={(e) => setEditingItem({...editingItem, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ram/Rom</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.ramRom}
                    onChange={(e) => setEditingItem({...editingItem, ramRom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">IMEI</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.imei}
                    onChange={(e) => setEditingItem({...editingItem, imei: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.color}
                    onChange={(e) => setEditingItem({...editingItem, color: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Price</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-slate-50 text-sm"
                    value={editingItem.price === 0 ? '' : editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </form>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-form"
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-slate-800">Sale Details</h3>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Customer Info</h4>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Name</span>
                  <span className="font-medium text-slate-800">{viewingSale.customerName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Phone</span>
                  <span className="font-medium text-slate-800">{viewingSale.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Address</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] break-words">{viewingSale.address}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Device Info</h4>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Brand</span>
                  <span className="font-medium text-slate-800">{viewingSale.brand}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Model</span>
                  <span className="font-medium text-slate-800">{viewingSale.model}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Ram/Rom</span>
                  <span className="font-medium text-slate-800">{viewingSale.ramRom || '-'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">IMEI</span>
                  <span className="font-medium text-slate-800">{viewingSale.imei}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Color</span>
                  <span className="font-medium text-slate-800">{viewingSale.color || '-'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50 border-dashed">
                  <span className="text-slate-500 text-sm">Sale Date</span>
                  <span className="font-medium text-slate-800">{new Date(viewingSale.soldAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-sky-700 font-semibold text-sm">Price</span>
                  <span className="font-bold text-sky-700">{viewingSale.price ? viewingSale.price.toLocaleString() : '-'}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button 
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-slate-800">Edit Sale Record</h3>
              <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <form id="edit-sale-form" onSubmit={handleEditSale} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                        value={editingSale.customerName}
                        onChange={(e) => setEditingSale({...editingSale, customerName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                        value={editingSale.phoneNumber}
                        onChange={(e) => setEditingSale({...editingSale, phoneNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                      <textarea
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                        value={editingSale.address}
                        onChange={(e) => setEditingSale({...editingSale, address: e.target.value})}
                        required
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Device Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm opacity-70 cursor-not-allowed"
                        value={editingSale.brand}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Model</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm opacity-70 cursor-not-allowed"
                        value={editingSale.model}
                        disabled
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">IMEI</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm opacity-70 cursor-not-allowed"
                        value={editingSale.imei}
                        disabled
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Price</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                        value={editingSale.price === 0 ? '' : editingSale.price}
                        onChange={(e) => setEditingSale({...editingSale, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setEditingSale(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-sale-form"
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Installment Modal */}
      {viewingInstSale && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-slate-800">Installment Sale Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportInstPDF}
                  disabled={isExportingInst}
                  className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-100 flex items-center gap-1.5"
                >
                  <Download size={14} />
                  {isExportingInst ? 'Exporting...' : 'Export PDF'}
                </button>
                <button onClick={() => setViewingInstSale(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg border border-transparent">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-2 text-[12px] leading-none" ref={instPdfRef} style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'serif' }}>
              <div className="text-center mb-2">
                <h1 className="font-bold tracking-tight text-base mb-1">Hein Htet San</h1>
                <h2 className="font-semibold text-sm mb-1">Mobile Phone Sales & Service</h2>
                <p className="mb-1">09768747313</p>
                <h3 className="font-medium mt-1">Installment Sale Contract</h3>
              </div>
              
              <div className="flex justify-between px-2 mb-1">
                <div>
                  <span className="font-medium mr-[50px]">Ticket ID</span>
                  <span>{viewingInstSale.id ? viewingInstSale.id.slice(0,6) : '000001'}</span>
                </div>
                <div>
                  <span className="font-medium mr-[50px]">Date</span>
                  <span>{new Date(viewingInstSale.soldAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-black p-2">
                  <h4 className="text-center font-medium mb-1 border-b border-black pb-1">Customer info</h4>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Name</span>
                      <span>{viewingInstSale.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone</span>
                      <span>{viewingInstSale.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address</span>
                      <span>{viewingInstSale.address}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-black p-2">
                  <h4 className="text-center font-medium mb-1 border-b border-black pb-1">Device Info</h4>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Model</span>
                      <span>{viewingInstSale.brand} {viewingInstSale.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ram/Rom</span>
                      <span>{viewingInstSale.ramRom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Color</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IMEI</span>
                      <span>{viewingInstSale.imei}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-black p-2">
                <h4 className="text-center font-medium mb-1 border-b border-black pb-1">Original Payments Info</h4>
                <div className="space-y-1 max-w-sm mx-auto mt-1">
                  <div className="flex justify-between">
                    <span>Device Price</span>
                    <span>{viewingInstSale.price.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest</span>
                    <span>{viewingInstSale.interest.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doc Fees</span>
                    <span>{viewingInstSale.docFees.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grand Total</span>
                    <span>{viewingInstSale.grandTotal.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Down Payment</span>
                    <span>{viewingInstSale.downPayment.toLocaleString()} MMK</span>
                  </div>
                </div>
              </div>

              <div className="border border-black p-2">
                <h4 className="text-center font-medium mb-2 border-b border-black pb-1">Monthly Payments List</h4>
                <div className="grid grid-cols-3 gap-y-2 gap-x-2 mt-1">
                  {viewingInstSale.monthlyPayments && viewingInstSale.monthlyPayments.map((p, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="mb-1">{idx + 1}Month</span>
                      <span>{p.toLocaleString()} MMK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Installment Sale Modal */}
      {editingInstSale && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-slate-800">Edit Installment Sale</h3>
              <button onClick={() => setEditingInstSale(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <form id="edit-inst-sale-form" onSubmit={handleEditInstSale} className="space-y-4">
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Financial Adjustments</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Down Payment</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                        value={editingInstSale.downPayment === 0 ? '' : editingInstSale.downPayment}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const totalPaid = editingInstSale.monthlyPayments.reduce((a, b) => a + b, 0);
                          const rem = editingInstSale.grandTotal - val - totalPaid;
                          setEditingInstSale({...editingInstSale, downPayment: val, remainBalance: rem});
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Monthly Payments Adjustment</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {editingInstSale.monthlyPayments.map((payment, idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Month {idx + 1}</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border-slate-300 focus:border-sky-500 focus:ring-sky-500 outline-none p-2 border bg-white text-sm"
                          value={payment === 0 ? '' : payment}
                          onChange={(e) => {
                            const newArr = [...editingInstSale.monthlyPayments];
                            newArr[idx] = parseFloat(e.target.value) || 0;
                            const totalPaid = newArr.reduce((a, b) => a + b, 0);
                            const rem = editingInstSale.grandTotal - editingInstSale.downPayment - totalPaid;
                            setEditingInstSale({...editingInstSale, monthlyPayments: newArr, remainBalance: rem});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-medium text-sm">
                    <span className="text-slate-700">Remain Balance</span>
                    <span className={editingInstSale.remainBalance === 0 ? 'text-emerald-600' : editingInstSale.remainBalance < 0 ? 'text-red-500' : 'text-orange-600'}>
                      {editingInstSale.remainBalance.toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setEditingInstSale(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-inst-sale-form"
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {(deletingId || deletingSaleId || deletingInstSaleId) && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-slate-800 text-lg mb-2">Delete Confirmation</h3>
              <p className="text-slate-500 text-sm mb-4">Please enter the password to confirm deletion.</p>
              
              <input
                type="password"
                className={`w-full rounded-lg border outline-none p-3 bg-slate-50 ${deleteError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
                placeholder="Enter password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                autoFocus
              />
              {deleteError && (
                <p className="text-red-500 text-xs mt-1">{deleteError}</p>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setDeletingId(null);
                  setDeletingSaleId(null);
                  setDeletingInstSaleId(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF Container */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        {viewingSale && (
          <SaleReceipt ref={receiptRef} sale={viewingSale} />
        )}
      </div>

    </div>
  );
};
