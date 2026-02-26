import { 
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Property, Transaction } from '../types';

const PROPERTIES = 'properties';
const TRANSACTIONS = 'transactions';

// Real-time listeners
export const onProperties = (cb: (props: Property[]) => void) =>
  onSnapshot(collection(db, PROPERTIES), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Property)));
  });

export const onTransactions = (cb: (txns: Transaction[]) => void) =>
  onSnapshot(collection(db, TRANSACTIONS), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
  });

// Properties CRUD
export const getProperties = async (): Promise<Property[]> => {
  const snap = await getDocs(collection(db, PROPERTIES));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Property));
};

export const addProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, PROPERTIES), { ...data, createdAt: now, updatedAt: now });
  return { ...data, id: ref.id, createdAt: now, updatedAt: now };
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  await updateDoc(doc(db, PROPERTIES, id), { ...data, updatedAt: new Date().toISOString() });
};

export const deleteProperty = async (id: string) => {
  await deleteDoc(doc(db, PROPERTIES, id));
  const q = query(collection(db, TRANSACTIONS), where('propertyId', '==', id));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
};

// Transactions CRUD
export const getTransactions = async (): Promise<Transaction[]> => {
  const snap = await getDocs(collection(db, TRANSACTIONS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
};

export const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, TRANSACTIONS), { ...data, createdAt: now });
  return { ...data, id: ref.id, createdAt: now };
};

export const deleteTransaction = async (id: string) => {
  await deleteDoc(doc(db, TRANSACTIONS, id));
};
