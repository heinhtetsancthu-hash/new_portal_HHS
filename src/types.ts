export type TicketStatus = 'Pending' | 'Not Repair' | 'Return To Customer' | 'Completed';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  createdAt: number;
}

export interface StockItem {
  id: string;
  brand: string;
  model: string;
  ramRom: string;
  imei: string;
  color: string;
  price: number;
  createdAt: number;
}

export interface SaleItem {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  stockId: string;
  brand: string;
  model: string;
  ramRom: string;
  imei: string;
  color: string;
  price: number;
  soldAt: number;
}

export interface InstallmentSaleItem {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  stockId: string;
  brand: string;
  model: string;
  ramRom: string;
  imei: string;
  color: string;
  price: number;
  interest: number;
  docFees: number;
  downPayment: number;
  months: number;
  monthlyPayments: number[];
  grandTotal: number;
  remainBalance: number;
  soldAt: number;
}

export interface SparepartItem {
  id: string;
  name: string;
  phoneNumber?: string;
  item: string;
  photo1: string;
  photo2: string;
  photo3: string;
  createdAt: number;
}

export interface AccessoryOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  item1: string;
  item2: string;
  item3: string;
  photo1: string;
  photo2: string;
  photo3: string;
  createdAt: number;
}

export interface SparepartStockItem {
  id: string;
  model: string;
  name: string;
  category: string;
  count: number;
  createdAt: number;
}

export interface Ticket {
  id: string;
  ticketId?: string;
  customerName: string;
  phoneNumber: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  errorType: string;
  estimatedCost: string;
  advancePayment?: string;
  screenLock: 'None' | 'Pin' | 'Password' | 'Pattern';
  screenLockValue?: string;
  accessories: string[];
  notes: string;
  photos: string[];
  status?: TicketStatus;
  realCost?: string;
  returnedAt?: number;
  createdAt: number;
  haveStock?: boolean;
  usedSparepartId?: string;
  usedSparepartName?: string;
}
