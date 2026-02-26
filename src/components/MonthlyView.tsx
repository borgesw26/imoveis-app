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
  // Track which property has the rent form open: propertyId or null
  const [rentFormOpen, setRentFormOpen] = useState<string | null>(null);
  const [rentFormAmount, setRentFormAmount] = useState('');
  const [rentFormDate, setRentFormDate] = useState('');

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
    if (loadingId) return; // Prevent double-clicks
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

  const openRentForm = (property: Property) => {
    const existing = findTransaction(property.id, 'Aluguel');
    if (existing) {
      // Already paid: clicking removes it
      togglePayment(property, 'Aluguel');
      return;
    }
    // Open the form pre-filled
    setRentFormOpen(property.id);
    setRentFormAmount(property.rentValue.toString());
    // Default date: today
    setRentFormDate(new Date().toISOString().split('T')[0]);
  };

  const submitRentForm = async (property: Property) => {
    if (loadingId) return; // Prevent double-clicks
    const amount = parseFloat(rentFormAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!rentFormDate) {
      alert('Informe a data do pagamento.');
      return;
    }
    const key = `${property.id}-Aluguel`;
    setLoadingId(key);
    try {
      await onAddTransaction({
        propertyId: property.id,
        type: 'income',
        category: 'Aluguel',
        description: `Aluguel ${MONTHS[month]}/${year} - ${property.name} ${property.unit}`,
        amount,
        date: rentFormDate,
      });
      setRentFormOpen(null);
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
          const rentTx = findTransaction(property.id, 'Aluguel');
          const rentPaid = !!rentTx;
          const condoPaid = !!findTransaction(property.id, 'Condomínio');
          const iptuPaid = !!findTransaction(property.id, 'IPTU');

          const allPaid = rentPaid && (property.condoFee <= 0 || condoPaid) && (property.iptu <= 0 || iptuPaid);
          const isFormOpen = rentFormOpen === property.id;

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

                {/* Rent payment: show details if paid */}
                {rentPaid && rentTx && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <Check className="w-4 h-4" />
                    <span>
                      Aluguel pago: <strong>{formatCurrency(rentTx.amount)}</strong> em{' '}
                      <strong>{new Date(rentTx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
                    </span>
                  </div>
                )}

                {/* Rent form (inline) */}
                {isFormOpen && !rentPaid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-blue-900">Registrar pagamento do aluguel</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-blue-700">Valor pago (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={rentFormAmount}
                          onChange={(e) => setRentFormAmount(e.target.value)}
                          className="w-full mt-0.5 px-2 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-blue-700">Data do pagamento</label>
                        <input
                          type="date"
                          value={rentFormDate}
                          onChange={(e) => setRentFormDate(e.target.value)}
                          className="w-full mt-0.5 px-2 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => submitRentForm(property)}
                        disabled={loadingId === `${property.id}-Aluguel`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => setRentFormOpen(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment buttons row */}
                <div className="flex flex-wrap gap-2">
                  <PaymentButton
                    label={`Aluguel ${formatCurrency(property.rentValue)}`}
                    paid={rentPaid}
                    loading={loadingId === `${property.id}-Aluguel`}
                    onClick={() => openRentForm(property)}
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
        💡 Clique em <strong>Aluguel</strong> para informar valor e data do pagamento. Condomínio e IPTU alternam entre Pago/Não Pago.
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
