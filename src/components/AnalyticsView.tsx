import { useState } from 'react';
import { Building2, FileSpreadsheet, CalendarDays, Download, DollarSign, AlertTriangle, TrendingUp, Calculator, ChevronRight, Home, Bell } from 'lucide-react';
import { Property, Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';

interface AnalyticsProps {
  properties: Property[];
  transactions: Transaction[];
}

// ─── Helpers ───
function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

function daysUntil(d: string) {
  return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function genSummary(props: Property[]) {
  const h = ['Imóvel', 'Unidade', 'Status', 'Inquilino', 'Aluguel', 'Valor Líquido'];
  const r = props.map(p => [p.name, p.unit, p.status === 'occupied' ? 'Alugado' : 'Vago', p.tenant || '-', p.rentValue, p.netValue].join(';'));
  return [h.join(';'), ...r].join('\n');
}

function genDetailed(props: Property[]) {
  const h = ['Imóvel', 'Unidade', 'Área (m²)', 'Valor do Imóvel', 'Aluguel', 'Condomínio', 'IPTU', 'Taxa Extra', 'Valor Líquido', 'Inquilino', 'Início Contrato', 'Fim Contrato', 'Dia Vencimento', 'Status', 'Observações'];
  const r = props.map(p => [p.name, p.unit, p.area, p.propertyValue, p.rentValue, p.condoFee, p.iptu, p.extraFee, p.netValue, p.tenant || '', p.startDate || '', p.endDate || '', p.dueDay, p.status === 'occupied' ? 'Alugado' : 'Vago', p.notes || ''].join(';'));
  return [h.join(';'), ...r].join('\n');
}

function genTransactions(tx: Transaction[], props: Property[]) {
  const h = ['Data', 'Imóvel', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
  const r = tx.map(t => {
    const p = props.find(pr => pr.id === t.propertyId);
    return [t.date, p ? `${p.name} - ${p.unit}` : 'Desconhecido', t.type === 'income' ? 'Receita' : 'Despesa', t.category, t.description, t.amount].join(';');
  });
  return [h.join(';'), ...r].join('\n');
}

function genAnnual(props: Property[], tx: Transaction[], yr: number) {
  const ms = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let s = `Relatório Anual - ${yr}\n\nRESUMO POR IMÓVEL\nImóvel;Unidade;Receita Anual;Despesas Anuais;Lucro\n`;
  props.forEach(p => {
    const ptx = tx.filter(t => t.propertyId === p.id && new Date(t.date).getFullYear() === yr);
    const inc = ptx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) || p.rentValue * 12;
    const exp = ptx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0) || (p.condoFee + p.iptu + p.extraFee) * 12;
    s += `${p.name};${p.unit};${inc};${exp};${inc - exp}\n`;
  });
  s += `\nRESUMO MENSAL\nMês;Receitas;Despesas;Saldo\n`;
  ms.forEach((m, i) => {
    const mtx = tx.filter(t => { const d = new Date(t.date); return d.getMonth() === i && d.getFullYear() === yr; });
    const inc = mtx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const exp = mtx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    s += `${m}/${yr};${inc};${exp};${inc - exp}\n`;
  });
  return s;
}

function calcStats(props: Property[], tx: Transaction[], yr: number) {
  const ytx = tx.filter(t => new Date(t.date).getFullYear() === yr);
  const mRent = props.filter(p => p.status === 'occupied').reduce((s, p) => s + p.rentValue, 0);
  const mExp = props.reduce((s, p) => s + p.condoFee + p.iptu + p.extraFee, 0);
  const inc = ytx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || mRent * 12;
  const exp = ytx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || mExp * 12;
  const occ = props.length > 0 ? (props.filter(p => p.status === 'occupied').length / props.length) * 100 : 0;
  return { totalIncome: inc, totalExpenses: exp, netProfit: inc - exp, avgOccupancy: occ };
}

// ─── Index rates ───
const INDICES: Record<string, { name: string; description: string; rates: Record<number, number> }> = {
  'IGP-M': { name: 'IGP-M', description: 'Índice Geral de Preços do Mercado', rates: { 2024: 4.83, 2023: 3.89, 2022: 5.45, 2021: 17.78, 2020: 23.14 } },
  'IPCA': { name: 'IPCA', description: 'Índice de Preços ao Consumidor Amplo', rates: { 2024: 4.62, 2023: 4.62, 2022: 5.79, 2021: 10.06, 2020: 4.52 } },
  'INPC': { name: 'INPC', description: 'Índice Nacional de Preços ao Consumidor', rates: { 2024: 4.77, 2023: 3.71, 2022: 5.93, 2021: 10.16, 2020: 5.45 } },
};

// ─── Alerts Section ───
interface Alert {
  property: Property;
  type: 'expired' | 'expiring' | 'vacant' | 'adjustment';
  priority: 'high' | 'medium' | 'low';
  message: string;
  detail: string;
}

function AlertsSection({ properties, onViewProperty }: { properties: Property[]; onViewProperty: (p: Property) => void }) {
  const alerts: Alert[] = [];
  const now = new Date();

  properties.forEach((p) => {
    if (p.endDate && new Date(p.endDate) < now && p.status === 'occupied') {
      alerts.push({ property: p, type: 'expired', priority: 'high', message: 'Contrato vencido!', detail: `Venceu em ${formatDate(p.endDate)}` });
    } else if (p.endDate && p.status === 'occupied') {
      const days = daysUntil(p.endDate);
      if (days <= 30 && days > 0) alerts.push({ property: p, type: 'expiring', priority: 'high', message: `Contrato vence em ${days} dias`, detail: `Vencimento: ${formatDate(p.endDate)}` });
      else if (days <= 60 && days > 30) alerts.push({ property: p, type: 'expiring', priority: 'medium', message: `Contrato vence em ${days} dias`, detail: `Vencimento: ${formatDate(p.endDate)}` });
      else if (days <= 90 && days > 60) alerts.push({ property: p, type: 'expiring', priority: 'low', message: `Contrato vence em ${days} dias`, detail: `Vencimento: ${formatDate(p.endDate)}` });
    }
    if (p.status === 'vacant') {
      alerts.push({ property: p, type: 'vacant', priority: 'high', message: 'Imóvel vazio', detail: `Perdendo ${formatCurrency(p.rentValue)}/mês` });
    }
    if (p.startDate && p.status === 'occupied') {
      const months = Math.floor((now.getTime() - new Date(p.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000));
      if (months >= 11 && months < 12) alerts.push({ property: p, type: 'adjustment', priority: 'medium', message: 'Reajuste em breve', detail: `Contrato completa 1 ano em ${12 - months} mês(es)` });
      else if (months >= 12 && months % 12 >= 11) alerts.push({ property: p, type: 'adjustment', priority: 'medium', message: 'Verificar reajuste anual', detail: `Contrato com ${Math.floor(months / 12)} ano(s)` });
    }
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const priorityClass = (p: string) => {
    switch (p) { case 'high': return 'bg-red-50 border-red-200 hover:bg-red-100'; case 'medium': return 'bg-amber-50 border-amber-200 hover:bg-amber-100'; default: return 'bg-blue-50 border-blue-200 hover:bg-blue-100'; }
  };
  const priorityText = (p: string) => {
    switch (p) { case 'high': return 'text-red-700'; case 'medium': return 'text-amber-700'; default: return 'text-blue-700'; }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Atenção Necessária
        </h2>
        {alerts.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded-full">{alerts.length} item(s)</span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="p-6">
          <div className="bg-emerald-50 rounded-lg p-6 text-center">
            <p className="text-emerald-800 font-semibold">Tudo em ordem! ✅</p>
            <p className="text-emerald-600 text-sm mt-1">Nenhum item requer atenção no momento.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {alerts.map((a, i) => (
            <div key={`${a.property.id}-${a.type}-${i}`} className={`p-4 cursor-pointer transition-colors border-l-4 ${priorityClass(a.priority)}`} onClick={() => onViewProperty(a.property)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={priorityText(a.priority)}>
                    {a.type === 'vacant' ? <Home className="w-4 h-4" /> : a.type === 'adjustment' ? <TrendingUp className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{a.property.name} - {a.property.unit}</p>
                    <p className={`text-sm font-medium ${priorityText(a.priority)}`}>{a.message}</p>
                    <p className="text-xs text-slate-500">{a.detail}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vacancy Section ───
function VacancySection({ properties, onViewProperty }: { properties: Property[]; onViewProperty: (p: Property) => void }) {
  const vacant = properties.filter(p => p.status === 'vacant');
  const occupied = properties.filter(p => p.status === 'occupied');
  const monthlyLoss = vacant.reduce((s, p) => s + p.condoFee + p.iptu + p.extraFee, 0);
  const occupancy = properties.length > 0 ? (occupied.length / properties.length) * 100 : 0;
  const idleValue = vacant.reduce((s, p) => s + p.propertyValue, 0);

  if (vacant.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Vacância
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-emerald-50 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-emerald-800 font-semibold">Todos os imóveis estão alugados! 🎉</p>
            <p className="text-emerald-600 text-sm mt-1">Taxa de ocupação: 100%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Imóveis Disponíveis para Alugar
        </h2>
      </div>
      <div className="p-6">
        <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Você está perdendo {formatCurrency(monthlyLoss)} por mês</p>
              <p className="text-sm text-red-600 mt-1">{vacant.length} imóvel(is) vazio(s) = {formatCurrency(monthlyLoss * 12)}/ano em perda</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Taxa de Ocupação</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{occupancy.toFixed(0)}%</span>
              <span className="text-sm text-slate-500 mb-1">({occupied.length}/{properties.length})</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${occupancy >= 80 ? 'bg-emerald-500' : occupancy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${occupancy}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Patrimônio Parado</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(idleValue)}</p>
            <p className="text-xs text-slate-500 mt-1">sem gerar renda</p>
          </div>
        </div>

        <div className="space-y-3">
          {vacant.map((p) => (
            <div key={p.id} className="border border-amber-200 rounded-xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="p-4 cursor-pointer" onClick={() => onViewProperty(p)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">{p.name} - {p.unit}</p>
                    <p className="text-sm text-slate-600">{p.notes || 'Sem descrição'}</p>
                    <p className="text-sm text-amber-700 mt-1">Perda mensal: {formatCurrency(p.condoFee + p.iptu + p.extraFee)}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/50 border-t border-amber-200 flex gap-4 text-xs text-slate-600">
                {p.area > 0 && <span>{p.area}m²</span>}
                {p.propertyValue > 0 && <span>Valor: {formatCurrency(p.propertyValue)}</span>}
                {p.rentValue > 0 && <span>Último aluguel: {formatCurrency(p.rentValue)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rent Adjustment Calculator ───
function RentCalculator({ properties }: { properties: Property[] }) {
  const [selectedIndex, setSelectedIndex] = useState('IGP-M');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [customRate, setCustomRate] = useState('');

  const occupied = properties.filter(p => p.status === 'occupied');
  const selected = occupied.find(p => p.id === selectedProperty);
  const currentYear = new Date().getFullYear();
  const rate = customRate ? parseFloat(customRate) : (INDICES[selectedIndex].rates[currentYear] || 5);

  const simulations = occupied.map(p => {
    const newRent = p.rentValue * (1 + rate / 100);
    return { property: p, currentRent: p.rentValue, newRent, increase: newRent - p.rentValue };
  });
  const totalCurrent = simulations.reduce((s, d) => s + d.currentRent, 0);
  const totalNew = simulations.reduce((s, d) => s + d.newRent, 0);
  const totalIncrease = totalNew - totalCurrent;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-violet-600" />
          Calculadora de Reajuste
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Index selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(INDICES).map((key) => (
            <button key={key} onClick={() => { setSelectedIndex(key); setCustomRate(''); }}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${selectedIndex === key && !customRate ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <p className="font-semibold text-slate-900">{INDICES[key].name}</p>
              <p className="text-xs text-slate-500">{INDICES[key].description}</p>
              <p className="text-lg font-bold text-violet-600 mt-1">{INDICES[key].rates[currentYear] || '-'}%</p>
            </button>
          ))}
        </div>

        {/* Custom rate */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Ou use taxa personalizada:</span>
          <div className="relative">
            <input type="number" step="0.01" value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Ex: 5.5"
              className="w-24 pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-violet-600" />
            <span className="font-semibold text-violet-900">Reajuste de {rate.toFixed(2)}% ({customRate ? 'Personalizado' : selectedIndex})</span>
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
              <p className="text-lg font-bold text-violet-600">+{formatCurrency(totalIncrease)}</p>
            </div>
          </div>
          <p className="text-xs text-center text-violet-600 mt-2">Aumento anual: {formatCurrency(totalIncrease * 12)}</p>
        </div>

        {/* Property detail selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Ver detalhes de um imóvel específico:</label>
          <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
            <option value="">Selecione um imóvel...</option>
            {occupied.map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {p.unit} ({p.tenant})</option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{selected.name} - {selected.unit}</p>
                <p className="text-sm text-slate-600">Inquilino: {selected.tenant}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-slate-500">Aluguel Atual</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(selected.rentValue)}</p>
              </div>
              <div className="bg-emerald-100 rounded p-3">
                <p className="text-xs text-emerald-700">Aluguel Reajustado</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(selected.rentValue * (1 + rate / 100))}</p>
              </div>
            </div>
            <div className="text-center pt-2 border-t">
              <p className="text-sm text-slate-600">
                Aumento de <span className="font-semibold text-violet-600">{formatCurrency(selected.rentValue * rate / 100)}</span> por mês
              </p>
              {selected.startDate && (
                <p className="text-xs text-slate-500 mt-1">
                  <CalendarDays className="w-3 h-3 inline mr-1" />
                  Contrato iniciado em {new Date(selected.startDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Simulation table */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Simulação para todos os imóveis:</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Imóvel</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Atual</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Reajustado</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulations.map(({ property: p, currentRent, newRent, increase }) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2"><span className="font-medium">{p.name}</span><span className="text-slate-500"> - {p.unit}</span></td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(currentRent)}</td>
                    <td className="px-3 py-2 text-right font-medium text-emerald-600">{formatCurrency(newRent)}</td>
                    <td className="px-3 py-2 text-right text-violet-600">+{formatCurrency(increase)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-semibold">
                <tr>
                  <td className="px-3 py-2">TOTAL</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totalCurrent)}</td>
                  <td className="px-3 py-2 text-right text-emerald-600">{formatCurrency(totalNew)}</td>
                  <td className="px-3 py-2 text-right text-violet-600">+{formatCurrency(totalIncrease)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Section ───
function ReportsSection({ properties, transactions }: { properties: Property[]; transactions: Transaction[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const today = new Date().toISOString().split('T')[0];

  const exp = (type: string) => {
    let c = '', f = '';
    switch (type) {
      case 'summary': c = genSummary(properties); f = `resumo-imoveis-${today}.csv`; break;
      case 'properties': c = genDetailed(properties); f = `imoveis-detalhado-${today}.csv`; break;
      case 'transactions': c = genTransactions(transactions, properties); f = `transacoes-${today}.csv`; break;
      case 'annual': c = genAnnual(properties, transactions, year); f = `relatorio-anual-${year}.csv`; break;
    }
    downloadCsv(c, f);
  };

  const stats = calcStats(properties, transactions, year);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Relatórios
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => exp('summary')} className="flex items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div className="text-left"><p className="font-medium text-emerald-900">Resumo dos Imóveis</p><p className="text-xs text-emerald-600">Visão geral simplificada</p></div>
            <Download className="w-4 h-4 text-emerald-600 ml-auto" />
          </button>
          <button onClick={() => exp('properties')} className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div className="text-left"><p className="font-medium text-blue-900">Imóveis Detalhado</p><p className="text-xs text-blue-600">Todos os dados dos imóveis</p></div>
            <Download className="w-4 h-4 text-blue-600 ml-auto" />
          </button>
          <button onClick={() => exp('transactions')} className="flex items-center justify-center gap-2 p-4 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5 text-violet-600" />
            <div className="text-left"><p className="font-medium text-violet-900">Transações</p><p className="text-xs text-violet-600">Histórico de pagamentos</p></div>
            <Download className="w-4 h-4 text-violet-600 ml-auto" />
          </button>
          <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-lg">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Relatório Anual</p>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="text-xs bg-transparent text-amber-700 border-none focus:ring-0 p-0">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => exp('annual')} className="p-2 hover:bg-amber-200 rounded transition-colors">
              <Download className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Prévia - Ano {year}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Receita Total</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalIncome)}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Despesas Total</p><p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Lucro Líquido</p><p className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(stats.netProfit)}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Ocupação Média</p><p className="text-lg font-bold text-blue-600">{stats.avgOccupancy.toFixed(0)}%</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Analytics View ───
export default function Analytics({ properties, transactions }: AnalyticsProps) {
  const handleViewProperty = (_p: Property) => {
    // Navigate to property details - handled by parent via callback if needed
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Análises e Relatórios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsSection properties={properties} onViewProperty={handleViewProperty} />
        <VacancySection properties={properties} onViewProperty={handleViewProperty} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentCalculator properties={properties} />
        <ReportsSection properties={properties} transactions={transactions} />
      </div>
    </div>
  );
}
