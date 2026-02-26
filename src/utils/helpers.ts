import { Property, DashboardStats, Transaction } from '../types';

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const [y, m, d] = dateString.split('-').map(Number);
    return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  } catch { return dateString; }
};

export const formatDateFull = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return dateString; }
};

export const getDaysUntilExpiration = (endDate: string): number => {
  if (!endDate) return Infinity;
  const end = new Date(endDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86400000);
};

export const getExpirationStatus = (endDate: string): 'expired' | 'critical' | 'warning' | 'ok' => {
  const days = getDaysUntilExpiration(endDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'ok';
};

export const getStatusLabel = (status: Property['status']): string =>
  ({ occupied: 'Alugado', vacant: 'Vago', maintenance: 'Manutenção' })[status];

export const getStatusColor = (status: Property['status']): string =>
  ({ occupied: 'bg-green-100 text-green-800', vacant: 'bg-yellow-100 text-yellow-800', maintenance: 'bg-red-100 text-red-800' })[status];

export const calculateDashboardStats = (properties: Property[], _transactions: Transaction[]): DashboardStats => {
  const occupied = properties.filter(p => p.status === 'occupied');
  const expiringContracts = properties
    .filter(p => p.endDate && p.status === 'occupied' && getDaysUntilExpiration(p.endDate) >= 0 && getDaysUntilExpiration(p.endDate) <= 90)
    .sort((a, b) => getDaysUntilExpiration(a.endDate) - getDaysUntilExpiration(b.endDate));

  return {
    totalProperties: properties.length,
    occupiedProperties: occupied.length,
    vacantProperties: properties.filter(p => p.status === 'vacant').length,
    totalMonthlyIncome: occupied.reduce((s, p) => s + p.rentValue, 0),
    totalPropertyValue: properties.reduce((s, p) => s + p.propertyValue, 0),
    expiringContracts,
  };
};

export const getCategoryOptions = (type: 'income' | 'expense'): string[] => {
  if (type === 'income') return ['Aluguel', 'Reajuste', 'Multa', 'Caução', 'Outros'];
  return ['Condomínio', 'IPTU', 'Manutenção', 'Reforma', 'Comissão Imobiliária', 'Seguro', 'Documentação', 'Outros'];
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
