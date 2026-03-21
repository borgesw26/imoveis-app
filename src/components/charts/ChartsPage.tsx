import { useState } from 'react';
import { Property, Transaction } from '../../types';
import { formatCurrency, MONTH_NAMES } from '../../utils/format';
import { PieChart, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface Props {
  properties: Property[];
  transactions: Transaction[];
}

export default function ChartsPage({ properties, transactions }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const navigate = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year && t.type === 'income' && t.category === 'Aluguel';
  });

  const propData = properties
    .map((p) => {
      const received = monthTx.filter((t) => t.propertyId === p.id).reduce((s, t) => s + t.amount, 0);
      return {
        id: p.id,
        name: `${p.name} ${p.unit}`,
        received,
        expected: p.rentValue,
        color: hashColor(p.id),
      };
    })
    .filter((d) => d.received > 0 || d.expected > 0);

  const totalReceived = propData.reduce((s, d) => s + d.received, 0);
  const totalExpected = propData.filter((d) => d.expected > 0).reduce((s, d) => s + d.expected, 0);

  // ROI data
  const roiData = properties
    .filter((p) => p.propertyValue > 0)
    .map((p) => {
      const received = monthTx.filter((t) => t.propertyId === p.id).reduce((s, t) => s + t.amount, 0);
      const roi = p.propertyValue > 0 ? (received * 12 / p.propertyValue) * 100 : 0;
      return { name: `${p.name} ${p.unit}`, roi, received, propertyValue: p.propertyValue };
    })
    .sort((a, b) => b.roi - a.roi);

  const maxROI = Math.max(...roiData.map((d) => d.roi), 1);

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
              <PieChart className="w-6 h-6 text-violet-600" />
              Gráficos - {MONTH_NAMES[month]} {year}
            </h1>
          </div>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Revenue by property */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Receita por Imóvel</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-slate-500">Esperado</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpected)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Recebido</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
          </div>
        </div>

        {propData.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Nenhum pagamento registrado neste mês.</p>
        ) : (
          <div className="space-y-3">
            {propData.map((d) => (
              <div key={d.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="text-slate-500">
                    {formatCurrency(d.received)} / {formatCurrency(d.expected)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{
                      width: `${d.expected > 0 ? Math.min((d.received / d.expected) * 100, 100) : 0}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROI */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Rentabilidade Anualizada (baseado no mês)
        </h2>
        {roiData.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Sem dados de rentabilidade.</p>
        ) : (
          <div className="space-y-3">
            {roiData.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="font-semibold text-violet-600">{d.roi.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-violet-500 transition-all"
                    style={{ width: `${(d.roi / maxROI) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        Os gráficos mostram apenas os <strong>pagamentos registrados</strong> na aba Mensal.
        Use as setas para ver outros meses.
      </div>
    </div>
  );
}
