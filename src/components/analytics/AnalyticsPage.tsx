import { useState } from 'react';
import { Property, Transaction } from '../../types';
import { formatCurrency, daysUntil, MONTH_NAMES } from '../../utils/format';
import { computeStats, INDICES } from '../../utils/stats';
import { generateAlerts } from '../../utils/alerts';
import {
  BarChart3, TrendingUp, AlertTriangle, Building2,
  ChevronRight, Calculator, Home as HomeIcon,
} from 'lucide-react';

interface Props {
  properties: Property[];
  transactions: Transaction[];
  onViewProperty: (p: Property) => void;
}

export default function AnalyticsPage({ properties, transactions, onViewProperty }: Props) {
  const stats = computeStats(properties);
  const alerts = generateAlerts(properties);
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-blue-600" />
        Análises
      </h1>

      {/* Portfolio Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumo do Patrimônio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Patrimônio Total" value={formatCurrency(stats.totalPropertyValue)} />
          <MetricCard label="Receita Mensal" value={formatCurrency(stats.totalMonthlyIncome)} />
          <MetricCard label="Despesas Mensais" value={formatCurrency(stats.monthlyExpenses)} />
          <MetricCard label="Yield Médio" value={
            stats.totalPropertyValue > 0
              ? `${((stats.totalMonthlyIncome * 12 / stats.totalPropertyValue) * 100).toFixed(2)}% a.a.`
              : '-'
          } />
        </div>
      </div>

      {/* Alerts */}
      <AlertsSection alerts={alerts} onViewProperty={onViewProperty} />

      {/* Vacancy Analysis */}
      <VacancySection properties={properties} stats={stats} onViewProperty={onViewProperty} />

      {/* Rent Adjustment Calculator */}
      <AdjustmentCalculator properties={properties} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function AlertsSection({ alerts, onViewProperty }: { alerts: any[]; onViewProperty: (p: Property) => void }) {
  if (alerts.length === 0) return null;

  const priorityBg = (p: string) =>
    p === 'high' ? 'hover:bg-red-50 border-l-red-500' : p === 'medium' ? 'hover:bg-amber-50 border-l-amber-500' : 'hover:bg-blue-50 border-l-blue-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Alertas e Notificações ({alerts.length})
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((a, i) => (
          <button
            key={`${a.property.id}-${a.type}-${i}`}
            onClick={() => onViewProperty(a.property)}
            className={`w-full p-4 text-left border-l-4 ${priorityBg(a.priority)} transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{a.property.name} - {a.property.unit}</p>
                <p className="text-sm font-medium text-amber-600">{a.message}</p>
                <p className="text-xs text-slate-500">{a.detail}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function VacancySection({ properties, stats, onViewProperty }: { properties: Property[]; stats: any; onViewProperty: (p: Property) => void }) {
  const vacant = properties.filter((p) => p.status === 'vacant');
  if (vacant.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <HomeIcon className="w-5 h-5 text-emerald-600" /> Vacância
        </h2>
        <p className="text-emerald-600 mt-2 font-medium">Todos os imóveis estão alugados!</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-amber-200">
        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Imóveis Vagos ({vacant.length})
        </h2>
        <p className="text-sm text-amber-700 mt-1">
          Ocupação: {stats.occupancyRate.toFixed(0)}% · Custo mensal de vacância: {formatCurrency(stats.vacantCost)}
        </p>
      </div>
      <div className="divide-y divide-amber-200">
        {vacant.map((p) => (
          <button
            key={p.id}
            onClick={() => onViewProperty(p)}
            className="w-full p-4 text-left hover:bg-amber-100/50 transition-colors"
          >
            <p className="font-medium text-amber-900">{p.name} - {p.unit}</p>
            <p className="text-sm text-amber-700 mt-1">
              Perda mensal: {formatCurrency(p.condoFee + p.iptu + p.extraFee)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdjustmentCalculator({ properties }: { properties: Property[] }) {
  const [index, setIndex] = useState('IGP-M');
  const [customRate, setCustomRate] = useState('');
  const occupied = properties.filter((p) => p.status === 'occupied');
  const year = new Date().getFullYear();
  const rate = customRate ? parseFloat(customRate) : INDICES[index]?.rates[year] || 5;

  const simulations = occupied.map((p) => {
    const newRent = p.rentValue * (1 + rate / 100);
    return { property: p, currentRent: p.rentValue, newRent, increase: newRent - p.rentValue };
  });

  const totalCurrent = simulations.reduce((s, d) => s + d.currentRent, 0);
  const totalNew = simulations.reduce((s, d) => s + d.newRent, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-violet-600" />
          Calculadora de Reajuste
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Index selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(INDICES).map((key) => (
            <button
              key={key}
              onClick={() => { setIndex(key); setCustomRate(''); }}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                index === key && !customRate ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-semibold text-slate-900">{INDICES[key].name}</p>
              <p className="text-xs text-slate-500">{INDICES[key].description}</p>
              <p className="text-lg font-bold text-violet-600 mt-1">{INDICES[key].rates[year] || '-'}%</p>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Ou use taxa personalizada:</span>
          <div className="relative">
            <input
              type="number" step="0.01" value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              placeholder="Ex: 5.5"
              className="w-24 pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            <span className="font-semibold text-violet-900">
              Reajuste de {rate.toFixed(2)}% ({customRate ? 'Personalizado' : index})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-600">Receita Atual</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(totalCurrent)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Nova Receita</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalNew)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Aumento Total</p>
              <p className="text-lg font-bold text-violet-600">+{formatCurrency(totalNew - totalCurrent)}</p>
            </div>
          </div>
          <p className="text-xs text-center text-violet-600 mt-2">
            Aumento anual: {formatCurrency((totalNew - totalCurrent) * 12)}
          </p>
        </div>

        {/* Per property */}
        {simulations.length > 0 && (
          <div className="space-y-2">
            {simulations.map((s) => (
              <div key={s.property.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                <span className="font-medium text-slate-700">{s.property.name} {s.property.unit}</span>
                <span className="text-slate-500">
                  {formatCurrency(s.currentRent)} → <span className="font-semibold text-violet-600">{formatCurrency(s.newRent)}</span>
                  {' '}(+{formatCurrency(s.increase)})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
