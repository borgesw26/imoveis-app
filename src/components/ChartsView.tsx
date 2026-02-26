import { Property, Transaction } from '../types';
import { formatCurrency, MONTH_NAMES } from '../utils/helpers';

interface ChartsViewProps {
  properties: Property[];
  transactions: Transaction[];
}

export default function ChartsView({ properties, transactions }: ChartsViewProps) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year && t.type === 'income';
  });
  const totalReceived = monthTxns.reduce((s, t) => s + t.amount, 0);
  const totalExpected = properties.filter(p => p.rentValue > 0).reduce((s, p) => s + p.rentValue, 0);
  const rentedProps = properties.filter(p => p.rentValue > 0);
  const maxRent = Math.max(...rentedProps.map(p => p.rentValue), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Gráficos - {MONTH_NAMES[month]} {year}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
          <p className="text-sm text-slate-500">Total Esperado</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpected)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
          <p className="text-sm text-slate-500">Total Recebido</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalReceived)}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Aluguel por Imóvel</h2>
        <div className="space-y-3">
          {rentedProps.map(p => {
            const received = monthTxns.filter(t => t.propertyId === p.id).reduce((s, t) => s + t.amount, 0);
            return (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{p.name} - {p.unit}</span>
                  <span className="text-slate-500">{formatCurrency(received)} / {formatCurrency(p.rentValue)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                  <div className="absolute bg-slate-200 h-3 rounded-full" style={{ width: `${(p.rentValue / maxRent) * 100}%` }} />
                  <div className="absolute bg-emerald-500 h-3 rounded-full" style={{ width: `${(received / maxRent) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-sm text-slate-400 text-center">Registre pagamentos na aba Mensal</p>
    </div>
  );
}
