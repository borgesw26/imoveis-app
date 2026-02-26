import { Building2, Home, List, Calendar, PieChart, BarChart3, Bell } from 'lucide-react';

type View = 'home' | 'properties' | 'property-details' | 'add-property' | 'edit-property' | 'monthly' | 'charts' | 'analytics';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  alertCount: number;
  onShowAlerts: () => void;
}

export default function Header({ currentView, onNavigate, alertCount, onShowAlerts }: HeaderProps) {
  const is = (views: View[]) => views.includes(currentView);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-slate-900">Meus Imóveis</h1>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavBtn icon={<Home className="w-4 h-4" />} label="Início" active={is(['home'])} onClick={() => onNavigate('home')} />
            <NavBtn icon={<List className="w-4 h-4" />} label="Imóveis" active={is(['properties','property-details','add-property','edit-property'])} onClick={() => onNavigate('properties')} />
            <NavBtn icon={<Calendar className="w-4 h-4" />} label="Mensal" active={is(['monthly'])} onClick={() => onNavigate('monthly')} activeColor="emerald" />
            <NavBtn icon={<PieChart className="w-4 h-4" />} label="Gráficos" active={is(['charts'])} onClick={() => onNavigate('charts')} activeColor="violet" hideOnMobile />
            <NavBtn icon={<BarChart3 className="w-4 h-4" />} label="Análises" active={is(['analytics'])} onClick={() => onNavigate('analytics')} activeColor="indigo" hideOnMobile />
            <button onClick={onShowAlerts} className="relative flex items-center px-2 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">
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

function NavBtn({ icon, label, active, onClick, activeColor = 'blue', hideOnMobile = false }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; activeColor?: string; hideOnMobile?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${active ? colors[activeColor] : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {icon}
      <span className={hideOnMobile ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  );
}
