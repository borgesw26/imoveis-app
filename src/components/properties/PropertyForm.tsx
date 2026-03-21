import { useState } from 'react';
import { Property } from '../../types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  property?: Property;
  onSubmit: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function PropertyForm({ property, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    name: property?.name || '',
    unit: property?.unit || '',
    area: property?.area || 0,
    propertyValue: property?.propertyValue || 0,
    rentValue: property?.rentValue || 0,
    condoFee: property?.condoFee || 0,
    iptu: property?.iptu || 0,
    extraFee: property?.extraFee || 0,
    tenant: property?.tenant || '',
    startDate: property?.startDate || '',
    endDate: property?.endDate || '',
    dueDay: property?.dueDay || 1,
    netValue: property?.netValue || 0,
    notes: property?.notes || '',
    status: property?.status || 'vacant' as Property['status'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isEdit = !!property;

  return (
    <div className="animate-slide-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Atualize as informações' : 'Preencha os dados do imóvel'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-200">
        {/* Basic Info */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Edifício *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade *</label>
              <input type="text" name="unit" value={form.unit} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Área (m²)</label>
              <input type="number" name="area" value={form.area || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="vacant">Vago</option>
                <option value="occupied">Alugado</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Imóvel (R$)</label>
              <input type="number" name="propertyValue" value={form.propertyValue || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Valores Financeiros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aluguel (R$)</label>
              <input type="number" name="rentValue" value={form.rentValue || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condomínio (R$)</label>
              <input type="number" name="condoFee" value={form.condoFee || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IPTU (R$)</label>
              <input type="number" name="iptu" value={form.iptu || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cota Extra (R$)</label>
              <input type="number" name="extraFee" value={form.extraFee || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Líquido (R$)</label>
              <input type="number" name="netValue" value={form.netValue || ''} onChange={handleChange} step="0.01"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dia de Vencimento</label>
              <input type="number" name="dueDay" value={form.dueDay} onChange={handleChange} min="1" max="31"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Tenant */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações do Aluguel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Inquilino</label>
              <input type="text" name="tenant" value={form.tenant} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Início Contrato</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fim Contrato</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Observações</h2>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre o imóvel..."
          />
        </div>

        {/* Actions */}
        <div className="p-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            {isEdit ? 'Salvar Alterações' : 'Adicionar Imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
}
