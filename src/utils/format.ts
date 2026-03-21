export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (date: string): string => {
  if (!date) return '-';
  try {
    const [y, m, d] = date.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  } catch {
    return date;
  }
};

export const formatDateLong = (date: string): string => {
  if (!date) return '-';
  try {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

export const daysUntil = (date: string): number => {
  if (!date) return Infinity;
  const target = new Date(date + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
};

export const contractStatus = (
  endDate: string
): 'expired' | 'critical' | 'warning' | 'ok' => {
  const days = daysUntil(endDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'ok';
};

export const statusLabel = (status: string): string =>
  ({ occupied: 'Alugado', vacant: 'Vago', maintenance: 'Manutenção' }[status] || status);

export const statusColor = (status: string): string =>
  ({
    occupied: 'bg-green-100 text-green-800',
    vacant: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
