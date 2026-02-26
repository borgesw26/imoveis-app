import { ArrowLeft, Edit2, Trash2, Home, User, Calendar, DollarSign, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Property, Transaction } from '../types';
import { formatCurrency, formatDate, formatDateFull, getStatusLabel, getStatusColor, getDaysUntilExpiration, getExpirationStatus } from '../utils/helpers';

interface PropertyDetailsProps {
  property: Property;
  transactions: Transaction[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export default function PropertyDetails({ 
  property, 
  transactions, 
  onBack, 
  onEdit, 
  onDelete, 
  onAddTransaction,
  onDeleteTransaction 
}: PropertyDetailsProps) {
  const daysUntilExpiration = getDaysUntilExpiration(property.endDate);
  const expirationStatus = getExpirationStatus(property.endDate);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="animate-slide-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <Home className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {property.name} - {property.unit}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </span>
                {property.area > 0 && (
                  <span className="text-sm text-slate-500">{property.area} m²</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 font-medium rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      {/* Contract Expiration Alert */}
      {property.status === 'occupied' && property.endDate && expirationStatus !== 'ok' && (
        <div className={`rounded-xl p-4 ${
          expirationStatus === 'expired' ? 'bg-red-50 border border-red-200' :
          expirationStatus === 'critical' ? 'bg-red-50 border border-red-200' :
          'bg-amber-50 border border-amber-200'
        }`}>
          <p className={`font-medium ${
            expirationStatus === 'expired' || expirationStatus === 'critical' ? 'text-red-800' : 'text-amber-800'
          }`}>
            {expirationStatus === 'expired' 
              ? `⚠️ Contrato vencido há ${Math.abs(daysUntilExpiration)} dias!`
              : `⚠️ Contrato vence em ${daysUntilExpiration} dias (${formatDateFull(property.endDate)})`
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumo Financeiro</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Valor do Imóvel</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {formatCurrency(property.propertyValue)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600">Aluguel Mensal</p>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {formatCurrency(property.rentValue)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600">Valor Líquido</p>
                <p className="text-xl font-bold text-green-700 mt-1">
                  {formatCurrency(property.netValue)}
                </p>
              </div>
              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-600">Rentabilidade</p>
                <p className="text-xl font-bold text-violet-700 mt-1">
                  {property.propertyValue > 0 
                    ? `${((property.rentValue * 12 / property.propertyValue) * 100).toFixed(2)}%`
                    : '-'
                  }
                </p>
                <p className="text-xs text-violet-500">ao ano</p>
              </div>
            </div>

            {/* Monthly Costs */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Custos Mensais</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Condomínio</span>
                  <span className="font-medium text-slate-900">{formatCurrency(property.condoFee)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">IPTU</span>
                  <span className="font-medium text-slate-900">{formatCurrency(property.iptu)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Cota Extra</span>
                  <span className="font-medium text-slate-900">{formatCurrency(property.extraFee)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Transações</h2>
              <button
                onClick={onAddTransaction}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </button>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="p-4 text-center border-r border-slate-200">
                <p className="text-sm text-slate-500">Receitas</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="p-4 text-center border-r border-slate-200">
                <p className="text-sm text-slate-500">Despesas</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500">Saldo</p>
                <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            {/* Transaction List */}
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 mt-3">Nenhuma transação registrada</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(transaction => (
                    <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' 
                            ? <TrendingUp className="w-5 h-5 text-green-600" />
                            : <TrendingDown className="w-5 h-5 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{transaction.description}</p>
                          <p className="text-sm text-slate-500">
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <button
                          onClick={() => onDeleteTransaction(transaction.id)}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenant Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Inquilino</h2>
            </div>

            {property.tenant ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Nome</p>
                  <p className="font-medium text-slate-900">{property.tenant}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vencimento Mensal</p>
                  <p className="font-medium text-slate-900">Dia {property.dueDay}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Imóvel sem inquilino</p>
            )}
          </div>

          {/* Contract Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Contrato</h2>
            </div>

            {property.startDate || property.endDate ? (
              <div className="space-y-3">
                {property.startDate && (
                  <div>
                    <p className="text-sm text-slate-500">Início</p>
                    <p className="font-medium text-slate-900">{formatDateFull(property.startDate)}</p>
                  </div>
                )}
                {property.endDate && (
                  <div>
                    <p className="text-sm text-slate-500">Término</p>
                    <p className="font-medium text-slate-900">{formatDateFull(property.endDate)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Sem contrato cadastrado</p>
            )}
          </div>

          {/* Notes */}
          {property.notes && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Observações</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
