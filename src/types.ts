export type TicketStatus = 'Pending' | 'Not Repair' | 'Return To Customer' | 'Completed';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
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
  screenLock: 'None' | 'Pin' | 'Password' | 'Pattern';
  screenLockValue?: string;
  accessories: string[];
  notes: string;
  photos: string[];
  status?: TicketStatus;
  returnedAt?: number;
  createdAt: number;
}
