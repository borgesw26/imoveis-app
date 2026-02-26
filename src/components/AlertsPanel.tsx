import { X, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { Property } from '../types';
import { formatDate, getDaysUntilExpiration, getExpirationStatus } from '../utils/helpers';

interface AlertsPanelProps {
  properties: Property[];
  onClose: () => void;
  onViewProperty: (property: Property) => void;
}

export default function AlertsPanel({ properties, onClose, onViewProperty }: AlertsPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative h-full w-full max-w-md bg-white shadow-xl animate-slide-in overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Alertas de Contratos</h2>
              <p className="text-sm text-slate-600">
                {properties.length} contrato(s) vencendo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mt-4">
                Tudo em dia!
              </h3>
              <p className="text-slate-500 mt-2">
                Nenhum contrato vence nos próximos 90 dias.
              </p>
            </div>
          ) : (
            properties.map(property => {
              const days = getDaysUntilExpiration(property.endDate);
              const status = getExpirationStatus(property.endDate);
              
              return (
                <div
                  key={property.id}
                  onClick={() => onViewProperty(property)}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    status === 'expired' ? 'bg-red-50 border border-red-200 hover:bg-red-100' :
                    status === 'critical' ? 'bg-red-50 border border-red-200 hover:bg-red-100' :
                    'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {property.name} - {property.unit}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          status === 'expired' || status === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {status === 'expired' ? 'Vencido' : `${days} dias`}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Inquilino:</span> {property.tenant}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Vencimento:</span> {formatDate(property.endDate)}
                        </p>
                      </div>

                      {status === 'expired' && (
                        <p className="mt-2 text-sm font-medium text-red-700">
                          ⚠️ Contrato vencido há {Math.abs(days)} dias
                        </p>
                      )}
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500 text-center">
            Contratos com vencimento em até 90 dias são exibidos aqui
          </p>
        </div>
      </div>
    </div>
  );
}
