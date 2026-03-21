import { Home, Building2, Calendar, PieChart, BarChart3, Bell, LogOut } from 'lucide-react';
import { Tab } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  alertCount: number;
  onAlertsClick: () => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'properties', label: 'Imóveis', icon: Building2 },
  { id: 'monthly', label: 'Mensal', icon: Calendar },
  { id: 'charts', label: 'Gráficos', icon: PieChart },
  { id: 'analytics', label: 'Análises', icon: BarChart3 },
];

export default function Navbar({ activeTab, onTabChange, alertCount, onAlertsClick }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">Meus Imóveis</span>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onAlertsClick}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden lg:block">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
