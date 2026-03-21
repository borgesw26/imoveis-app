import { Property } from '../../types';
import { formatCurrency, daysUntil, statusLabel, statusColor } from '../../utils/format';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface Props {
  property: Property;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PropertyCard({ property: p, onView, onEdit, onDelete }: Props) {
  const contractDays = p.endDate && p.status === 'occupied' ? daysUntil(p.endDate) : null;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900">
            {p.name} - {p.unit}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
            {statusLabel(p.status)}
          </span>
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p>
            Aluguel: {formatCurrency(p.rentValue)}
            {p.condoFee > 0 && ` · Cond: ${formatCurrency(p.condoFee)}`}
            {p.iptu > 0 && ` · IPTU: ${formatCurrency(p.iptu)}`}
          </p>
          {p.tenant && <p>Inquilino: {p.tenant}</p>}
          {contractDays !== null && contractDays >= 0 && contractDays <= 90 && (
            <p className={`font-medium ${contractDays <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
              Contrato vence em {contractDays} dias
            </p>
          )}
          {p.notes && <p className="text-slate-500 line-clamp-2">{p.notes}</p>}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalhes"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
