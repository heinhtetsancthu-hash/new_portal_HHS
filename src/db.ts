import { Ticket, Transaction, TemperGlassBrand, TemperGlassItem, StockItem, SaleItem, InstallmentSaleItem, SparepartItem, AccessoryOrder, SparepartStockItem, DailyRecordItem } from './types';
import { db, auth } from './firebase';
import { doc, setDoc, getDocs, getDoc, deleteDoc, collection, writeBatch, onSnapshot, query, orderBy } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const requireAuth = () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to perform this operation');
  }
  return auth.currentUser.uid;
};

export const saveTicket = async (ticket: Ticket): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    await setDoc(doc(db, path, ticket.id), ticket);
    await addNotification(`New ticket created for ${ticket.customerName}`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getTickets = async (): Promise<Ticket[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const tickets: Ticket[] = [];
    querySnapshot.forEach((doc) => {
      tickets.push(doc.data() as Ticket);
    });
    return tickets.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateTicket = async (ticket: Ticket): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    await setDoc(doc(db, path, ticket.id), ticket, { merge: true });
    await addNotification(`Ticket updated for ${ticket.customerName}`, 'info');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTicket = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Ticket deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const clearAllTickets = async (): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      batch.delete(document.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const insertTickets = async (tickets: Ticket[]): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/tickets`;
  try {
    const batch = writeBatch(db);
    tickets.forEach(ticket => {
      const docRef = doc(db, path, ticket.id);
      batch.set(docRef, ticket);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveTransaction = async (txData: Transaction): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/transactions`;
  try {
    await setDoc(doc(db, path, txData.id), txData);
    await addNotification(`Transaction saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/transactions`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const txs: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      txs.push(doc.data() as Transaction);
    });
    return txs.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/transactions`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Transaction deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateTransaction = async (txData: Transaction): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/transactions`;
  try {
    await setDoc(doc(db, path, txData.id), txData, { merge: true });
    await addNotification(`Transaction updated`, 'info');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const saveStockItem = async (stockItem: StockItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/stocks`;
  try {
    await setDoc(doc(db, path, stockItem.id), stockItem);
    await addNotification(`Stock item ${stockItem.brand} ${stockItem.model} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getStockItems = async (): Promise<StockItem[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/stocks`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: StockItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as StockItem);
    });
    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteStockItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/stocks`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Stock item deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveSaleItem = async (saleItem: SaleItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/sales`;
  try {
    await setDoc(doc(db, path, saleItem.id), saleItem);
    await addNotification(`Cash sale for ${saleItem.customerName} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getSaleItems = async (): Promise<SaleItem[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/sales`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: SaleItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as SaleItem);
    });
    return items.sort((a, b) => b.soldAt - a.soldAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteSaleItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/sales`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Cash sale deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getSettings = async (settingsKey: string): Promise<any> => {
  const userId = requireAuth();
  const path = `users/${userId}/settings`;
  try {
    const docSnap = await getDoc(doc(db, path, settingsKey));
    if (docSnap.exists()) {
      return docSnap.data().value;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const saveSettings = async (settingsKey: string, value: any): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/settings`;
  try {
    await setDoc(doc(db, path, settingsKey), { value }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToSettings = (settingsKey: string, callback: (value: any) => void): (() => void) => {
  try {
    const userId = requireAuth();
    const path = `users/${userId}/settings`;
    const docRef = doc(db, path, settingsKey);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().value);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Settings snapshot error:", error);
    });
  } catch (error) {
    console.error("Failed to subscribe to settings:", error);
    return () => {};
  }
};

export interface NotificationItem {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
}

export const addNotification = async (message: string, type: 'info' | 'success' | 'warning' = 'info'): Promise<void> => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const path = `users/${userId}/notifications`;
  try {
    const id = Date.now().toString();
    await setDoc(doc(db, path, id), { id, message, timestamp: Date.now(), type });
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
};

export const subscribeToNewNotifications = (callback: (notification: NotificationItem) => void): (() => void) => {
  if (!auth.currentUser) return () => {};
  const userId = auth.currentUser.uid;
  const path = `users/${userId}/notifications`;
  const startTime = Date.now();

  try {
    const q = collection(db, path);
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as NotificationItem;
          if (data.timestamp > startTime) {
            callback(data);
          }
        }
      });
    }, (error) => {
      console.error("Notifications snapshot error:", error);
    });
  } catch (error) {
    console.error("Failed to subscribe to notifications:", error);
    return () => {};
  }
};

export const saveInstallmentSaleItem = async (installmentSaleItem: InstallmentSaleItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/installmentSales`;
  try {
    await setDoc(doc(db, path, installmentSaleItem.id), installmentSaleItem);
    await addNotification(`Installment sale for ${installmentSaleItem.customerName} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getInstallmentSaleItems = async (): Promise<InstallmentSaleItem[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/installmentSales`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: InstallmentSaleItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as InstallmentSaleItem);
    });
    return items.sort((a, b) => b.soldAt - a.soldAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteInstallmentSaleItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/installmentSales`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Installment sale deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveSparepartItem = async (sparepartItem: SparepartItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/spareparts`;
  try {
    await setDoc(doc(db, path, sparepartItem.id), sparepartItem);
    await addNotification(`Sparepart item ${sparepartItem.name} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getSparepartItems = async (): Promise<SparepartItem[]> => {
  const userId = requireAuth();
  const path = `users/${userId}/spareparts`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: SparepartItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as SparepartItem);
    });
    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const subscribeToSpareparts = (callback: (items: SparepartItem[]) => void): (() => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return () => {};
  }
  
  const path = `users/${userId}/spareparts`;
  
  try {
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items: SparepartItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as SparepartItem);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const deleteSparepartItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/spareparts`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Sparepart item deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveAccessoryOrder = async (order: AccessoryOrder): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/accessory_orders`;
  try {
    await setDoc(doc(db, path, order.id), order);
    await addNotification(`Accessory order for ${order.customerName} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToAccessoryOrders = (callback: (items: AccessoryOrder[]) => void): (() => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return () => {};
  }
  
  const path = `users/${userId}/accessory_orders`;
  
  try {
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items: AccessoryOrder[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as AccessoryOrder);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const deleteAccessoryOrder = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/accessory_orders`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Accessory order deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const saveSparepartStockItem = async (item: SparepartStockItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/sparepart_stocks`;
  try {
    await setDoc(doc(db, path, item.id), item);
    await addNotification(`Sparepart stock for ${item.model} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToSparepartStockItems = (callback: (items: SparepartStockItem[]) => void): (() => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return () => {};
  }
  
  const path = `users/${userId}/sparepart_stocks`;
  
  try {
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items: SparepartStockItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as SparepartStockItem);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const deleteSparepartStockItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/sparepart_stocks`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Sparepart stock item deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const decrementSparepartStockItemCount = async (id: string, decrementBy: number = 1): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/sparepart_stocks`;
  try {
    const docRef = doc(db, path, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SparepartStockItem;
      const newCount = Math.max(0, data.count - decrementBy);
      await setDoc(docRef, { count: newCount }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};




export const saveDailyRecord = async (item: DailyRecordItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/daily_records`;
  try {
    await setDoc(doc(db, path, item.id), item);
    await addNotification(`Daily record for ${item.name} saved`, 'success');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToDailyRecords = (callback: (items: DailyRecordItem[]) => void): (() => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return () => {};
  }
  
  const path = `users/${userId}/daily_records`;
  
  try {
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items: DailyRecordItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as DailyRecordItem);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const deleteDailyRecord = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/daily_records`;
  try {
    await deleteDoc(doc(db, path, id));
    await addNotification(`Daily record deleted`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateDailyRecord = async (item: DailyRecordItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/daily_records`;
  try {
    await setDoc(doc(db, path, item.id), item, { merge: true });
    await addNotification(`Daily record for ${item.name} updated`, 'info');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const subscribeToTemperGlassBrands = (callback: (brands: TemperGlassBrand[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, `users/${userId}/temper_glass_brands`),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemperGlassBrand)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/temper_glass_brands`);
  });
};

export const saveTemperGlassBrand = async (brand: TemperGlassBrand): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass_brands`;
  try {
    await setDoc(doc(db, path, brand.id), brand);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateTemperGlassBrand = async (brand: TemperGlassBrand): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass_brands`;
  try {
    await setDoc(doc(db, path, brand.id), brand, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTemperGlassBrand = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass_brands`;
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToTemperGlassItems = (callback: (items: TemperGlassItem[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, `users/${userId}/temper_glass`),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemperGlassItem)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/temper_glass`);
  });
};

export const saveTemperGlassItem = async (item: TemperGlassItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass`;
  try {
    await setDoc(doc(db, path, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateTemperGlassItem = async (item: TemperGlassItem): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass`;
  try {
    await setDoc(doc(db, path, item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTemperGlassItem = async (id: string): Promise<void> => {
  const userId = requireAuth();
  const path = `users/${userId}/temper_glass`;
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};


export const exportAllData = async (): Promise<any> => {
  const userId = requireAuth();
  const collections = [
    'tickets', 'transactions', 'stocks', 'sales', 'installmentSales',
    'spareparts', 'accessory_orders', 'sparepart_stocks', 'daily_records',
    'temper_glass', 'temper_glass_brands'
  ];
  
  const allData: any = {};
  
  for (const col of collections) {
    const path = `users/${userId}/${col}`;
    const querySnapshot = await getDocs(collection(db, path));
    allData[col] = querySnapshot.docs.map(doc => doc.data());
  }
  
  return allData;
};

export const importAllData = async (data: any): Promise<void> => {
  const userId = requireAuth();
  const collections = [
    'tickets', 'transactions', 'stocks', 'sales', 'installmentSales',
    'spareparts', 'accessory_orders', 'sparepart_stocks', 'daily_records',
    'temper_glass', 'temper_glass_brands'
  ];
  
  for (const col of collections) {
    if (data[col] && Array.isArray(data[col])) {
      const path = `users/${userId}/${col}`;
      
      // Delete existing
      const existingDocs = await getDocs(collection(db, path));
      for (const docSnap of existingDocs.docs) {
        await deleteDoc(doc(db, path, docSnap.id));
      }
      
      // Insert new
      for (const item of data[col]) {
        if (item.id) {
          await setDoc(doc(db, path, item.id), item);
        }
      }
    }
  }
};
