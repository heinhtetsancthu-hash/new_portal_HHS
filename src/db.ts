import { Ticket, Transaction, StockItem, SaleItem, InstallmentSaleItem } from './types';
import { db, auth } from './firebase';
import { doc, setDoc, getDocs, getDoc, deleteDoc, collection, writeBatch, onSnapshot } from 'firebase/firestore';

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


