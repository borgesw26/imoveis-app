import { useState } from 'react';
import { Property, Transaction } from '../../types';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyDetail from './PropertyDetail';
import { Plus, Search } from 'lucide-react';

interface Props {
  properties: Property[];
  transactions: Transaction[];
  onAdd: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Property>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

type View = 'list' | 'form' | 'detail';

export default function PropertiesPage({ properties, transactions, onAdd, onUpdate, onDelete, onDeleteTransaction }: Props) {
  const [view, setView] = useState<View>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = properties.filter((p) => {
    const matchSearch = `${p.name} ${p.unit} ${p.tenant}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (view === 'form') {
    return (
      <PropertyForm
        property={selectedProperty}
        onSubmit={async (data) => {
          if (selectedProperty) {
            await onUpdate(selectedProperty.id, data);
          } else {
            await onAdd(data);
          }
          setView('list');
          setSelectedProperty(undefined);
        }}
        onCancel={() => { setView('list'); setSelectedProperty(undefined); }}
      />
    );
  }

  if (view === 'detail' && selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        transactions={transactions}
        onEdit={() => setView('form')}
        onDelete={async () => {
          if (confirm(`Excluir ${selectedProperty.name} - ${selectedProperty.unit}?`)) {
            await onDelete(selectedProperty.id);
            setView('list');
            setSelectedProperty(undefined);
          }
        }}
        onBack={() => { setView('list'); setSelectedProperty(undefined); }}
        onDeleteTransaction={onDeleteTransaction}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Imóveis</h1>
          <p className="text-sm text-slate-500">{properties.length} imóvel(eis) cadastrado(s)</p>
        </div>
        <button
          onClick={() => { setSelectedProperty(undefined); setView('form'); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Imóvel
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, unidade ou inquilino..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="occupied">Alugados</option>
          <option value="vacant">Vagos</option>
          <option value="maintenance">Manutenção</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Nenhum imóvel encontrado</h3>
          <p className="text-slate-500 mt-1">Comece adicionando seu primeiro imóvel</p>
          <button
            onClick={() => { setSelectedProperty(undefined); setView('form'); }}
            className="mt-4 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Adicionar Imóvel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onView={() => { setSelectedProperty(p); setView('detail'); }}
              onEdit={() => { setSelectedProperty(p); setView('form'); }}
              onDelete={async () => {
                if (confirm(`Excluir ${p.name} - ${p.unit}?`)) await onDelete(p.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
