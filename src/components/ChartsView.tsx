import { useState } from 'react';
import { BarChart3, PieChart, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Property, Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

function getColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface ChartsProps {
  properties: Property[];
  transactions: Transaction[];
}

export default function Charts({ properties, transactions }: ChartsProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const navigate = (delta: number) => {
    let m = month + delta, y = year;
    if (m > 11) { m = 0; y++; } else if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year && t.type === 'income' && t.category === 'Aluguel';
  });

  const data = properties
    .map((p) => {
      const received = monthTx.filter((t) => t.propertyId === p.id).reduce((s, t) => s + t.amount, 0);
      return { id: p.id, name: `${p.name} ${p.unit}`, received, expected: p.rentValue, color: getColor(p.id) };
    })
    .filter((d) => d.received > 0 || d.expected > 0);

  const totalReceived = data.reduce((s, d) => s + d.received, 0);
  const totalExpected = data.filter((d) => d.expected > 0).reduce((s, d) => s + d.expected, 0);

  // ROI data
  const roiData = properties
    .filter((p) => p.propertyValue > 0)
    .map((p) => {
      const monthlyReceived = monthTx.filter((t) => t.propertyId === p.id).reduce((s, t) => s + t.amount, 0);
      const roi = p.propertyValue > 0 ? (monthlyReceived * 12 / p.propertyValue) * 100 : 0;
      return { name: `${p.name} ${p.unit}`, roi, monthlyReceived, propertyValue: p.propertyValue, hasPayment: monthlyReceived > 0 };
    })
    .sort((a, b) => b.roi - a.roi);

  const maxRoi = Math.max(...roiData.map((d) => d.roi), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month nav */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <BarChart3 className="w-6 h-6 text-violet-600" />
              Gráficos - {MONTHS[month]} {year}
            </h1>
            <p className="text-sm text-slate-500">Dados baseados nos pagamentos registrados</p>
          </div>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            Receita Recebida no Mês
          </h2>
          {totalReceived > 0 ? (
            <>
              <div className="flex items-center gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.filter((d) => d.received > 0).reduce<{ elements: React.ReactNode[]; offset: number }>(
                      (acc, d) => {
                        const pct = (d.received / totalReceived) * 100;
                        acc.elements.push(
                          <circle key={d.name} cx="50" cy="50" r="40" fill="transparent" stroke={d.color}
                            strokeWidth="20" strokeDasharray={`${pct * 2.51} ${251 - pct * 2.51}`}
                            strokeDashoffset={-acc.offset * 2.51} className="transition-all duration-500" />
                        );
                        acc.offset += pct;
                        return acc;
                      }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Recebido</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
                  {data.filter((d) => d.received > 0).map((d) => {
                    const pct = (d.received / totalReceived) * 100;
                    return (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-slate-600 truncate">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-medium text-slate-900">{formatCurrency(d.received)}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Total Esperado</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(totalExpected)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Recebido</p>
                  <p className="font-semibold text-emerald-600">{formatCurrency(totalReceived)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhum pagamento registrado neste mês</p>
              <p className="text-sm text-slate-400 mt-1">Registre pagamentos na aba Mensal</p>
            </div>
          )}
        </div>

        {/* ROI */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Rentabilidade no Mês (ROI Anualizado)
          </h2>
          {roiData.some((d) => d.hasPayment) ? (
            <div className="space-y-3">
              {roiData.filter((d) => d.hasPayment).map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-medium text-emerald-600">{d.roi.toFixed(2)}% a.a.</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${d.roi >= 6 ? 'bg-emerald-500' : d.roi >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((d.roi / Math.max(maxRoi, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Recebido: {formatCurrency(d.monthlyReceived)} • Valor imóvel: {formatCurrency(d.propertyValue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhum pagamento para calcular ROI</p>
              <p className="text-sm text-slate-400 mt-1">Registre pagamentos na aba Mensal</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Bom (≥6%)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Regular (4-6%)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Baixo (&lt;4%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💡 Os gráficos mostram apenas os <strong>pagamentos registrados</strong> na aba Mensal. Use as setas para ver outros meses.
      </div>
    </div>
  );
}
