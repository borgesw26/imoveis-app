import { Property, Transaction } from '../types';

export function computeStats(properties: Property[]) {
  const occupied = properties.filter((p) => p.status === 'occupied');
  const vacant = properties.filter((p) => p.status === 'vacant');

  return {
    totalProperties: properties.length,
    occupiedProperties: occupied.length,
    vacantProperties: vacant.length,
    totalMonthlyIncome: occupied.reduce((s, p) => s + p.rentValue, 0),
    totalPropertyValue: properties.reduce((s, p) => s + p.propertyValue, 0),
    occupancyRate: properties.length > 0 ? (occupied.length / properties.length) * 100 : 0,
    monthlyExpenses: properties.reduce((s, p) => s + p.condoFee + p.iptu + p.extraFee, 0),
    vacantCost: vacant.reduce((s, p) => s + p.condoFee + p.iptu + p.extraFee, 0),
  };
}

export const INDICES: Record<string, { name: string; description: string; rates: Record<number, number> }> = {
  'IGP-M': {
    name: 'IGP-M',
    description: 'Índice Geral de Preços do Mercado',
    rates: { 2024: 4.77, 2023: 3.71, 2022: 5.93, 2021: 10.16, 2020: 5.45 },
  },
  'IPCA': {
    name: 'IPCA',
    description: 'Índice de Preços ao Consumidor',
    rates: { 2024: 4.77, 2023: 3.71, 2022: 5.93, 2021: 10.16, 2020: 5.45 },
  },
};

export function exportPropertiesCSV(properties: Property[]): string {
  const header = ['Nome', 'Unidade', 'Status', 'Inquilino', 'Aluguel', 'Valor Líquido'];
  const rows = properties.map((p) =>
    [p.name, p.unit, p.status === 'occupied' ? 'Alugado' : 'Vago', p.tenant || '-', p.rentValue, p.netValue].join(';')
  );
  return [header.join(';'), ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
