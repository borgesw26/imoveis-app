import { Plus, Eye, Edit2, Trash2, Home, Search } from 'lucide-react';
import { useState } from 'react';
import { Property } from '../types';
import { formatCurrency, getStatusLabel, getStatusColor, getDaysUntilExpiration, formatDate } from '../utils/helpers';

interface PropertyListProps {
  properties: Property[];
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function PropertyList({ properties, onView, onEdit, onDelete, onAdd }: PropertyListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.name.toLowerCase().includes(search.toLowerCase()) ||
      property.unit.toLowerCase().includes(search.toLowerCase()) ||
      property.tenant.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Imóveis</h1>
          <p className="text-slate-600 mt-1">
            {properties.length} imóvel(eis) cadastrado(s)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Imóvel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, unidade ou inquilino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="occupied">Alugados</option>
          <option value="vacant">Vagos</option>
          <option value="maintenance">Em Manutenção</option>
        </select>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mt-4">
            Nenhum imóvel encontrado
          </h3>
          <p className="text-slate-500 mt-2">
            {search || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro imóvel'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={onAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Imóvel
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => onView(property)}
              onEdit={() => onEdit(property)}
              onDelete={() => onDelete(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PropertyCard({ property, onView, onEdit, onDelete }: PropertyCardProps) {
  const daysUntilExpiration = getDaysUntilExpiration(property.endDate);
  const isExpiringSoon = property.status === 'occupied' && daysUntilExpiration <= 90 && daysUntilExpiration >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{property.name}</h3>
              <p className="text-sm text-slate-500">Unidade {property.unit}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {getStatusLabel(property.status)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Aluguel</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(property.rentValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Valor Imóvel</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(property.propertyValue)}</p>
          </div>
        </div>

        {/* Tenant Info */}
        {property.status === 'occupied' && property.tenant && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Inquilino</p>
                <p className="font-medium text-slate-900">{property.tenant}</p>
              </div>
              {property.endDate && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Término</p>
                  <p className="text-sm text-slate-700">{formatDate(property.endDate)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expiration Warning */}
        {isExpiringSoon && (
          <div className={`px-3 py-2 rounded-lg text-sm ${
            daysUntilExpiration <= 30 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            ⚠️ Contrato vence em {daysUntilExpiration} dias
          </div>
        )}

        {/* Notes */}
        {property.notes && (
          <p className="text-sm text-slate-600 line-clamp-2">{property.notes}</p>
        )}
      </div>

      {/* Card Footer */}
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
          <Edit2 className="w-5 h-5" />
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
