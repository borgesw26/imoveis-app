import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Property, Transaction } from '../types';

const PROPERTIES_COLLECTION = 'properties';
const TRANSACTIONS_COLLECTION = 'transactions';

// Properties CRUD
export const getProperties = async (): Promise<Property[]> => {
  const snapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Property));
};

export const addProperty = async (
  property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Property> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, PROPERTIES_COLLECTION), {
    ...property,
    createdAt: now,
    updatedAt: now,
  });
  return { ...property, id: ref.id, createdAt: now, updatedAt: now };
};

export const updateProperty = async (
  id: string,
  data: Partial<Property>
): Promise<void> => {
  await updateDoc(doc(db, PROPERTIES_COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteProperty = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('propertyId', '==', id)
  );
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
};

// Transactions CRUD
export const getTransactions = async (): Promise<Transaction[]> => {
  const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> => {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    createdAt: now,
  });
  return { ...transaction, id: ref.id, createdAt: now };
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
};
