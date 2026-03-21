import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Navbar from './components/layout/Navbar';
import HomePage from './components/home/HomePage';
import PropertiesPage from './components/properties/PropertiesPage';
import MonthlyPage from './components/monthly/MonthlyPage';
import ChartsPage from './components/charts/ChartsPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import { Property, Transaction, Tab } from './types';
import { generateAlerts } from './utils/alerts';
import {
  getProperties, addProperty, updateProperty, deleteProperty,
  getTransactions, addTransaction, deleteTransaction,
} from './utils/storage';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [props, txs] = await Promise.all([getProperties(), getTransactions()]);
      setProperties(props);
      setTransactions(txs);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const alerts = generateAlerts(properties);

  const handleAddProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProp = await addProperty(data);
    setProperties((prev) => [...prev, newProp]);
  };

  const handleUpdateProperty = async (id: string, data: Partial<Property>) => {
    await updateProperty(id, data);
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const handleDeleteProperty = async (id: string) => {
    await deleteProperty(id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((t) => t.propertyId !== id));
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = await addTransaction(data);
    setTransactions((prev) => [...prev, newTx]);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleViewProperty = (p: Property) => {
    setActiveTab('properties');
    // The PropertiesPage will handle showing the detail view
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} alertCount={0} onAlertsClick={() => {}} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-500">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} alertCount={0} onAlertsClick={() => {}} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={alerts.length}
        onAlertsClick={() => setActiveTab('analytics')}
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <HomePage
            properties={properties}
            transactions={transactions}
            alerts={alerts}
            onViewProperty={handleViewProperty}
            onTabChange={(t) => setActiveTab(t as Tab)}
            userName={user.displayName || 'Usuário'}
          />
        )}
        {activeTab === 'properties' && (
          <PropertiesPage
            properties={properties}
            transactions={transactions}
            onAdd={handleAddProperty}
            onUpdate={handleUpdateProperty}
            onDelete={handleDeleteProperty}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
        {activeTab === 'monthly' && (
          <MonthlyPage
            properties={properties}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
        {activeTab === 'charts' && (
          <ChartsPage properties={properties} transactions={transactions} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPage
            properties={properties}
            transactions={transactions}
            onViewProperty={handleViewProperty}
          />
        )}
      </main>
    </div>
  );
}
