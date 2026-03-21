export interface Property {
  id: string;
  name: string;
  unit: string;
  area: number;
  propertyValue: number;
  rentValue: number;
  condoFee: number;
  iptu: number;
  extraFee: number;
  tenant: string;
  startDate: string;
  endDate: string;
  dueDay: number;
  netValue: number;
  notes: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

export type Tab = 'home' | 'properties' | 'monthly' | 'charts' | 'analytics';

export interface Alert {
  property: Property;
  type: 'expired' | 'expiring' | 'vacant' | 'adjustment';
  priority: 'high' | 'medium' | 'low';
  message: string;
  detail: string;
}
