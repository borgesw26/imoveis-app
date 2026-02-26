import { Property, Transaction } from '../types';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getDaysUntilExpiration } from '../utils/helpers';

interface AnalyticsViewProps {
  properties: Property[];
  transactions: Transaction[];
}

export default function AnalyticsView({ properties, transactions: _transactions }: AnalyticsViewProps) {
  const occupied = properties.filter(p => p.status === 'occupied');
  const totalRent = occupied.reduce((s, p) => s + p.rentValue, 0);
  const totalCondo = occupied.reduce((s, p) => s + p.condoFee, 0);
  const totalIptu = occupied.reduce((s, p) => s + p.iptu, 0);
  const totalValue = properties.reduce((s, p) => s + p.propertyValue, 0);
  const capRate = totalValue > 0 ? ((totalRent * 12) / totalValue * 100).toFixed(2) : '0';
  const vacancyRate = properties.length > 0 ? ((properties.filter(p => p.status === 'vacant').length / properties.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Análises e Relatórios</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Cap Rate" value={`${capRate}%`} />
        <MetricCard label="Taxa Vacância" value={`${vacancyRate}%`} />
        <MetricCard label="Custo Condomínio/mês" value={formatCurrency(totalCondo)} />
        <MetricCard label="Custo IPTU/mês" value={formatCurrency(totalIptu)} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Resumo dos Imóveis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Imóvel</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Aluguel</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Condomínio</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">IPTU</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Inquilino</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Contrato</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {properties.map(p => {
                const days = getDaysUntilExpiration(p.endDate);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{p.name} - {p.unit}</td>
                    <td className="px-4 py-3">{formatCurrency(p.rentValue)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.condoFee)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.iptu)}</td>
                    <td className="px-4 py-3">{p.tenant || '-'}</td>
                    <td className="px-4 py-3">
                      {p.endDate ? <span className={days <= 90 ? 'text-amber-600 font-medium' : ''}>{formatDate(p.endDate)} ({days}d)</span> : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-slate-400 text-center">Registre pagamentos na aba Mensal. Use as setas para ver outros meses.</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
