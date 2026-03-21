import { useState } from 'react';
import { Property, Transaction } from '../../types';
import { formatCurrency, MONTH_NAMES } from '../../utils/format';
import { Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface Props {
  properties: Property[];
  transactions: Transaction[];
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

function PaymentButton({ label, paid, loading, onClick }: {
  label: string; paid: boolean; loading: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        paid
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
      }`}
    >
      {paid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {label}
    </button>
  );
}

export default function MonthlyPage({ properties, transactions, onAddTransaction, onDeleteTransaction }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingRent, setEditingRent] = useState<string | null>(null);
  const [rentAmount, setRentAmount] = useState('');
  const [rentDate, setRentDate] = useState('');

  const navigate = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const occupiedProps = properties.filter((p) => p.rentValue > 0);

  const findTransaction = (propertyId: string, category: string) =>
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

  const togglePayment = async (property: Property, category: string) => {
    const key = `${property.id}-${category}`;
    if (processing) return;
    setProcessing(key);
    try {
      const existing = findTransaction(property.id, category);
      if (existing) {
        await onDeleteTransaction(existing.id);
      } else {
        const amount = category === 'Condomínio' ? property.condoFee : property.iptu;
        await onAddTransaction({
          propertyId: property.id,
          type: 'income',
          category,
          description: `${category} ${MONTH_NAMES[month]}/${year} - ${property.name} ${property.unit}`,
          amount,
          date: new Date(year, month, 15).toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar. Tente novamente.');
    }
    setProcessing(null);
  };

  const handleRentClick = (property: Property) => {
    const existing = findTransaction(property.id, 'Aluguel');
    if (existing) {
      // Toggle off
      togglePayment(property, 'Aluguel');
      return;
    }
    setEditingRent(property.id);
    setRentAmount(property.rentValue.toString());
    setRentDate(new Date().toISOString().split('T')[0]);
  };

  const confirmRent = async (property: Property) => {
    const amount = parseFloat(rentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!rentDate) {
      alert('Informe a data do pagamento.');
      return;
    }
    const key = `${property.id}-Aluguel`;
    setProcessing(key);
    try {
      await onAddTransaction({
        propertyId: property.id,
        type: 'income',
        category: 'Aluguel',
        description: `Aluguel ${MONTH_NAMES[month]}/${year} - ${property.name} ${property.unit}`,
        amount,
        date: rentDate,
      });
      setEditingRent(null);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar. Tente novamente.');
    }
    setProcessing(null);
  };

  const expected = occupiedProps.reduce((s, p) => s + p.rentValue, 0);
  const received = occupiedProps.reduce((s, p) => {
    const t = findTransaction(p.id, 'Aluguel');
    return s + (t?.amount || 0);
  }, 0);
  const paidCount = occupiedProps.filter((p) => findTransaction(p.id, 'Aluguel')).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with month navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              {MONTH_NAMES[month]} {year}
            </h1>
            <p className="text-sm text-slate-500">{paidCount} de {occupiedProps.length} pagos</p>
          </div>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-slate-500">Esperado</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(expected)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Recebido</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(received)}</p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        Clique em <strong>Aluguel</strong> para informar valor e data do pagamento.
        Condomínio e IPTU alternam entre Pago/Não Pago.
        Gráficos mostram apenas os <strong>pagamentos registrados</strong> na aba Mensal.
      </div>

      {/* Property payments */}
      <div className="space-y-2">
        {occupiedProps.map((p) => {
          const rentPaid = !!findTransaction(p.id, 'Aluguel');
          const rentTx = findTransaction(p.id, 'Aluguel');
          const condoPaid = !!findTransaction(p.id, 'Condomínio');
          const iptuPaid = !!findTransaction(p.id, 'IPTU');
          const allPaid = rentPaid && (p.condoFee <= 0 || condoPaid) && (p.iptu <= 0 || iptuPaid);
          const isEditing = editingRent === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                allPaid ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.name} - {p.unit}</h3>
                  <p className="text-sm text-slate-500">
                    Vence dia {p.dueDay || 1} · Aluguel: {formatCurrency(p.rentValue)}
                    {p.condoFee > 0 && ` · Cond: ${formatCurrency(p.condoFee)}`}
                    {p.iptu > 0 && ` · IPTU: ${formatCurrency(p.iptu)}`}
                  </p>
                </div>

                {/* Rent payment confirmation */}
                {rentPaid && rentTx && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <Check className="w-4 h-4" />
                    <span>
                      Aluguel pago: <strong>{formatCurrency(rentTx.amount)}</strong> em{' '}
                      <strong>{new Date(rentTx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
                    </span>
                  </div>
                )}

                {/* Rent edit form */}
                {isEditing && !rentPaid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-blue-900">Registrar pagamento do aluguel</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-blue-700">Valor pago (R$)</label>
                        <input
                          type="number" step="0.01" value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          className="w-full mt-0.5 px-2 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-blue-700">Data do pagamento</label>
                        <input
                          type="date" value={rentDate}
                          onChange={(e) => setRentDate(e.target.value)}
                          className="w-full mt-0.5 px-2 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => confirmRent(p)}
                        disabled={processing === `${p.id}-Aluguel`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Confirmar
                      </button>
                      <button
                        onClick={() => setEditingRent(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment buttons */}
                <div className="flex flex-wrap gap-2">
                  <PaymentButton
                    label={`Aluguel ${formatCurrency(p.rentValue)}`}
                    paid={rentPaid}
                    loading={processing === `${p.id}-Aluguel`}
                    onClick={() => handleRentClick(p)}
                  />
                  {p.condoFee > 0 && (
                    <PaymentButton
                      label={`Condomínio ${formatCurrency(p.condoFee)}`}
                      paid={condoPaid}
                      loading={processing === `${p.id}-Condomínio`}
                      onClick={() => togglePayment(p, 'Condomínio')}
                    />
                  )}
                  {p.iptu > 0 && (
                    <PaymentButton
                      label={`IPTU ${formatCurrency(p.iptu)}`}
                      paid={iptuPaid}
                      loading={processing === `${p.id}-IPTU`}
                      onClick={() => togglePayment(p, 'IPTU')}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {occupiedProps.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Nenhum imóvel com aluguel cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
