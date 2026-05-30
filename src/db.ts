import { Ticket } from './types';

const DB_NAME = 'RepairCenterDB';
const STORE_NAME = 'tickets';
const TX_STORE = 'transactions';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TX_STORE)) {
        db.createObjectStore(TX_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveTicket = async (ticket: Ticket): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(ticket);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getTickets = async (): Promise<Ticket[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateTicket = async (ticket: Ticket): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(ticket);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteTicket = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearAllTickets = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const insertTickets = async (tickets: Ticket[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    tickets.forEach(ticket => {
      store.put(ticket);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const saveTransaction = async (txData: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_STORE, 'readwrite');
    const store = tx.objectStore(TX_STORE);
    const request = store.add(txData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getTransactions = async (): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_STORE, 'readonly');
    const store = tx.objectStore(TX_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_STORE, 'readwrite');
    const store = tx.objectStore(TX_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateTransaction = async (txData: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_STORE, 'readwrite');
    const store = tx.objectStore(TX_STORE);
    const request = store.put(txData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
