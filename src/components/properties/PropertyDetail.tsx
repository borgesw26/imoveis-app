import { Property, Transaction } from '../../types';
import { formatCurrency, formatDateLong, contractStatus, statusLabel, statusColor } from '../../utils/format';
import { ArrowLeft, Pencil, Trash2, Building2, User, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface Props {
  property: Property;
  transactions: Transaction[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onDeleteTransaction: (id: string) => void;
}

export default function PropertyDetail({ property: p, transactions, onEdit, onDelete, onBack, onDeleteTransaction }: Props) {
  const cs = p.endDate ? contractStatus(p.endDate) : 'ok';
  const propTransactions = transactions
    .filter((t) => t.propertyId === p.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{p.name} - {p.unit}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                {statusLabel(p.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 font-medium rounded-lg transition-colors">
              <Pencil className="w-4 h-4" /> Editar
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        </div>

        {/* Contract alert */}
        {p.status === 'occupied' && p.endDate && cs !== 'ok' && (
          <div className={`mt-4 rounded-xl p-4 ${
            cs === 'expired' || cs === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`font-medium ${cs === 'expired' || cs === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
              {cs === 'expired' ? 'Contrato vencido!' : `Contrato vence em breve`}
            </p>
          </div>
        )}
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-600">Aluguel</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(p.rentValue)}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl">
          <p className="text-sm text-emerald-600">Valor Líquido</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(p.netValue)}</p>
        </div>
        <div className="p-4 bg-violet-50 rounded-xl">
          <p className="text-sm text-violet-600">Rentabilidade</p>
          <p className="text-xl font-bold text-violet-700 mt-1">
            {p.propertyValue > 0 ? `${((p.rentValue * 12 / p.propertyValue) * 100).toFixed(2)}%` : '-'}
          </p>
          <p className="text-xs text-violet-500">ao ano</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600">Valor do Imóvel</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(p.propertyValue)}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" /> Custos Mensais
          </h2>
          <div className="space-y-3">
            {[
              ['Condomínio', p.condoFee],
              ['IPTU', p.iptu],
              ['Cota Extra', p.extraFee],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">{label as string}</span>
                <span className="font-medium text-slate-900">{formatCurrency(value as number)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-slate-500" /> Inquilino
          </h2>
          {p.tenant ? (
            <div className="space-y-3">
              <div><p className="text-sm text-slate-500">Nome</p><p className="font-medium">{p.tenant}</p></div>
              <div><p className="text-sm text-slate-500">Vencimento Mensal</p><p className="font-medium">Dia {p.dueDay}</p></div>
              {p.startDate && <div><p className="text-sm text-slate-500">Início</p><p className="font-medium">{formatDateLong(p.startDate)}</p></div>}
              {p.endDate && <div><p className="text-sm text-slate-500">Término</p><p className="font-medium">{formatDateLong(p.endDate)}</p></div>}
            </div>
          ) : (
            <p className="text-slate-500">Sem contrato cadastrado</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {p.notes && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Observações</h2>
          <p className="text-slate-600">{p.notes}</p>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Transações Recentes
        </h2>
        {propTransactions.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma transação registrada. Registre pagamentos na aba Mensal.</p>
        ) : (
          <div className="space-y-2">
            {propTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
