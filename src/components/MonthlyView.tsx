import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Property, Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type PaymentCategory = 'Aluguel' | 'Condomínio' | 'IPTU';

interface MonthlyViewProps {
  properties: Property[];
  transactions: Transaction[];
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export default function MonthlyView({
  properties,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const navigate = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const rentProperties = properties.filter((p) => p.rentValue > 0);

  const findTransaction = (propertyId: string, category: PaymentCategory) =>
    transactions.find((t) => {
      const d = new Date(t.date);
      return (
        t.propertyId === propertyId &&
        t.type === 'income' &&
        t.category === category &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

  const togglePayment = async (property: Property, category: PaymentCategory) => {
    const key = `${property.id}-${category}`;
    setLoadingId(key);
    try {
      const existing = findTransaction(property.id, category);
      if (existing) {
        await onDeleteTransaction(existing.id);
      } else {
        const amount =
          category === 'Aluguel'
            ? property.rentValue
            : category === 'Condomínio'
              ? property.condoFee
              : property.iptu;

        await onAddTransaction({
          propertyId: property.id,
          type: 'income',
          category,
          description: `${category} ${MONTHS[month]}/${year} - ${property.name} ${property.unit}`,
          amount,
          date: new Date(year, month, 15).toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar. Tente novamente.');
    }
    setLoadingId(null);
  };

  const totalExpected = rentProperties.reduce((sum, p) => sum + p.rentValue, 0);
  const totalReceived = rentProperties.reduce((sum, p) => {
    const tx = findTransaction(p.id, 'Aluguel');
    return sum + (tx?.amount || 0);
  }, 0);
  const paidCount = rentProperties.filter((p) => findTransaction(p.id, 'Aluguel')).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month navigation + summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              {MONTHS[month]} {year}
            </h1>
            <p className="text-sm text-slate-500">
              {paidCount} de {rentProperties.length} pagos
            </p>
          </div>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-slate-500">Esperado</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalExpected)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Recebido</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
          </div>
        </div>
      </div>

      {/* Property cards */}
      <div className="space-y-2">
        {rentProperties.map((property) => {
          const rentPaid = !!findTransaction(property.id, 'Aluguel');
          const condoPaid = !!findTransaction(property.id, 'Condomínio');
          const iptuPaid = !!findTransaction(property.id, 'IPTU');

          const allPaid = rentPaid && (property.condoFee <= 0 || condoPaid) && (property.iptu <= 0 || iptuPaid);

          return (
            <div
              key={property.id}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                allPaid ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Property info */}
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {property.name} - {property.unit}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Vence dia {property.dueDay || 1} • Aluguel: {formatCurrency(property.rentValue)}
                    {property.condoFee > 0 && ` • Cond: ${formatCurrency(property.condoFee)}`}
                    {property.iptu > 0 && ` • IPTU: ${formatCurrency(property.iptu)}`}
                  </p>
                </div>

                {/* Payment buttons row */}
                <div className="flex flex-wrap gap-2">
                  <PaymentButton
                    label={`Aluguel ${formatCurrency(property.rentValue)}`}
                    paid={rentPaid}
                    loading={loadingId === `${property.id}-Aluguel`}
                    onClick={() => togglePayment(property, 'Aluguel')}
                  />
                  {property.condoFee > 0 && (
                    <PaymentButton
                      label={`Condomínio ${formatCurrency(property.condoFee)}`}
                      paid={condoPaid}
                      loading={loadingId === `${property.id}-Condomínio`}
                      onClick={() => togglePayment(property, 'Condomínio')}
                    />
                  )}
                  {property.iptu > 0 && (
                    <PaymentButton
                      label={`IPTU ${formatCurrency(property.iptu)}`}
                      paid={iptuPaid}
                      loading={loadingId === `${property.id}-IPTU`}
                      onClick={() => togglePayment(property, 'IPTU')}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rentProperties.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">Nenhum imóvel com aluguel cadastrado.</p>
          <p className="text-sm text-slate-400 mt-1">Vá em Imóveis para definir os valores de aluguel.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💡 Clique nos botões para alternar entre <strong>Pago</strong> e <strong>Não Pago</strong> para Aluguel, Condomínio e IPTU.
      </div>
    </div>
  );
}

interface PaymentButtonProps {
  label: string;
  paid: boolean;
  loading: boolean;
  onClick: () => void;
}

function PaymentButton({ label, paid, loading, onClick }: PaymentButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all
        ${loading ? 'opacity-50 cursor-wait' : ''}
        ${paid
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }
      `}
    >
      {loading ? (
        <span className="animate-pulse">...</span>
      ) : paid ? (
        <>
          <Check className="w-4 h-4" />
          {label}
        </>
      ) : (
        <>
          <X className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}
