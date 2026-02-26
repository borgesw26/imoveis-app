import { useState } from 'react';
import { ArrowLeft, Save, Home } from 'lucide-react';
import { Property } from '../types';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState({
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
    status: property?.status || 'vacant' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!property;

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h1>
          <p className="text-slate-600">
            {isEditing ? 'Atualize as informações do imóvel' : 'Preencha os dados do novo imóvel'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Basic Info Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Informações Básicas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Edifício *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: LUDCO"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidade *
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                placeholder="Ex: 1301"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Área (m²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vacant">Vago</option>
                <option value="occupied">Alugado</option>
                <option value="maintenance">Em Manutenção</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Info Section */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações Financeiras</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor do Imóvel (R$)
              </label>
              <input
                type="number"
                name="propertyValue"
                value={formData.propertyValue || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Aluguel (R$)
              </label>
              <input
                type="number"
                name="rentValue"
                value={formData.rentValue || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Condomínio (R$)
              </label>
              <input
                type="number"
                name="condoFee"
                value={formData.condoFee || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                IPTU (R$)
              </label>
              <input
                type="number"
                name="iptu"
                value={formData.iptu || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cota Extra (R$)
              </label>
              <input
                type="number"
                name="extraFee"
                value={formData.extraFee || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor Líquido (R$)
              </label>
              <input
                type="number"
                name="netValue"
                value={formData.netValue || ''}
                onChange={handleChange}
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dia de Vencimento
              </label>
              <input
                type="number"
                name="dueDay"
                value={formData.dueDay}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rental Info Section */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informações do Aluguel</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Inquilino
              </label>
              <input
                type="text"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                placeholder="Nome completo"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Início do Contrato
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Término do Contrato
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Observações</h2>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Informações adicionais sobre o imóvel..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Save className="w-5 h-5" />
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
}
