import { Property, Transaction, Alert } from '../../types';
import { formatCurrency, daysUntil, MONTH_NAMES } from '../../utils/format';
import { computeStats } from '../../utils/stats';
import {
  Building2, TrendingUp, TrendingDown, Home, ChevronRight,
  Calendar, AlertTriangle, DollarSign, Users,
} from 'lucide-react';

interface HomePageProps {
  properties: Property[];
  transactions: Transaction[];
  alerts: Alert[];
  onViewProperty: (p: Property) => void;
  onTabChange: (tab: string) => void;
  userName: string;
}

export default function HomePage({
  properties, transactions, alerts, onViewProperty, onTabChange, userName,
}: HomePageProps) {
  const stats = computeStats(properties);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year && t.type === 'income' && t.category === 'Aluguel';
  });
  const received = monthTransactions.reduce((s, t) => s + t.amount, 0);
  const paidCount = new Set(monthTransactions.map((t) => t.propertyId)).size;
  const occupiedWithRent = properties.filter((p) => p.status === 'occupied' && p.rentValue > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Olá, {userName}!</h1>
        <p className="text-blue-100 mt-1">
          {MONTH_NAMES[month]} {year} - Resumo do seu patrimônio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          label="Total Imóveis"
          value={String(stats.totalProperties)}
          sub={`${stats.occupiedProperties} alugados`}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          label="Receita Mensal"
          value={formatCurrency(stats.totalMonthlyIncome)}
          sub={`${paidCount}/${occupiedWithRent.length} pagos`}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          label="Patrimônio Total"
          value={formatCurrency(stats.totalPropertyValue)}
          sub={`Yield: ${stats.totalPropertyValue > 0 ? ((stats.totalMonthlyIncome * 12 / stats.totalPropertyValue) * 100).toFixed(1) : 0}% a.a.`}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-amber-600" />}
          label="Ocupação"
          value={`${stats.occupancyRate.toFixed(0)}%`}
          sub={`${stats.vacantProperties} vagos`}
          bg="bg-amber-50"
        />
      </div>

      {/* Monthly Progress */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Pagamentos de {MONTH_NAMES[month]}
          </h2>
          <button
            onClick={() => onTabChange('monthly')}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Ver detalhes <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-100 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all"
              style={{ width: `${occupiedWithRent.length > 0 ? (paidCount / occupiedWithRent.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-600">
            {formatCurrency(received)} / {formatCurrency(stats.totalMonthlyIncome)}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Atenção ({alerts.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((a, i) => (
              <button
                key={`${a.property.id}-${a.type}-${i}`}
                onClick={() => onViewProperty(a.property)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 text-left"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {a.property.name} - {a.property.unit}
                  </p>
                  <p className={`text-sm font-medium ${
                    a.priority === 'high' ? 'text-red-600' : a.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {a.message}
                  </p>
                  <p className="text-xs text-slate-500">{a.detail}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vacant Properties Cost */}
      {stats.vacantProperties > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Custo de Vacância
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            {stats.vacantProperties} imóvel(is) vago(s) custando{' '}
            <strong>{formatCurrency(stats.vacantCost)}/mês</strong> em condomínio, IPTU e taxas.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, bg,
}: { icon: React.ReactNode; label: string; value: string; sub: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
