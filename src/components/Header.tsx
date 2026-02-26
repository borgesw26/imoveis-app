import { Building2, Home, List, CalendarDays, PieChart, BarChart3, Bell } from 'lucide-react';

export type View = 'home' | 'properties' | 'property-details' | 'add-property' | 'edit-property' | 'monthly' | 'charts' | 'analytics';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  alertCount: number;
  onShowAlerts: () => void;
}

export default function Header({ currentView, onNavigate, alertCount, onShowAlerts }: HeaderProps) {
  const isActive = (views: View[]) => views.includes(currentView);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-3 cursor-pointer flex-shrink-0"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-slate-900">Meus Imóveis</h1>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive(['home']) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Início</span>
            </button>

            <button
              onClick={() => onNavigate('properties')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive(['properties', 'property-details', 'add-property', 'edit-property'])
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Imóveis</span>
            </button>

            <button
              onClick={() => onNavigate('monthly')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive(['monthly']) ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Mensal</span>
            </button>

            <button
              onClick={() => onNavigate('charts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive(['charts']) ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Gráficos</span>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive(['analytics']) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análises</span>
            </button>

            <button
              onClick={onShowAlerts}
              className="relative flex items-center px-2 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
