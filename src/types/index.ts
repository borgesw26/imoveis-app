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

export type PropertyFormData = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

export interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalMonthlyIncome: number;
  totalPropertyValue: number;
  expiringContracts: Property[];
}
