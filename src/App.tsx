import { useState, useEffect, useCallback } from 'react';
import { Property, Transaction } from './types';
import {
  getProperties, getTransactions, addProperty, updateProperty,
  deleteProperty, addTransaction, deleteTransaction,
} from './utils/storage';
import { calculateDashboardStats } from './utils/helpers';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PropertyList from './components/PropertyList';
import PropertyForm from './components/PropertyForm';
import PropertyDetails from './components/PropertyDetails';
import TransactionForm from './components/TransactionForm';
import AlertsPanel from './components/AlertsPanel';
import MonthlyView from './components/MonthlyView';
import Charts from './components/ChartsView';
import Analytics from './components/AnalyticsView';

type View = 'home' | 'properties' | 'property-details' | 'add-property' | 'edit-property' | 'monthly' | 'charts' | 'analytics';

function App() {
  const [view, setView] = useState<View>('home');
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [propertiesData, transactionsData] = await Promise.all([
        getProperties(),
        getTransactions(),
      ]);
      setProperties(propertiesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(true); }, [loadData]);

  const stats = calculateDashboardStats(properties, transactions);

  const handleAddProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addProperty(data);
    await loadData();
    setView('properties');
  };

  const handleUpdateProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedProperty) {
      await updateProperty(selectedProperty.id, data);
      await loadData();
      setView('properties');
      setSelectedProperty(null);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteProperty(id);
      await loadData();
      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
        setView('properties');
      }
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setView('property-details');
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setView('edit-property');
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    await addTransaction(data);
    await loadData();
    setShowTransactionForm(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomePage />;
      case 'properties':
        return (
          <PropertyList
            properties={properties}
            onView={handleViewProperty}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onAdd={() => setView('add-property')}
          />
        );
      case 'add-property':
        return <PropertyForm onSubmit={handleAddProperty} onCancel={() => setView('properties')} />;
      case 'edit-property':
        return selectedProperty ? (
          <PropertyForm
            property={selectedProperty}
            onSubmit={handleUpdateProperty}
            onCancel={() => { setSelectedProperty(null); setView('properties'); }}
          />
        ) : null;
      case 'property-details':
        return selectedProperty ? (
          <PropertyDetails
            property={selectedProperty}
            transactions={transactions.filter((t) => t.propertyId === selectedProperty.id)}
            onBack={() => { setSelectedProperty(null); setView('properties'); }}
            onEdit={() => handleEditProperty(selectedProperty)}
            onDelete={() => handleDeleteProperty(selectedProperty.id)}
            onAddTransaction={() => setShowTransactionForm(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : null;
      case 'monthly':
        return (
          <MonthlyView
            properties={properties}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'charts':
        return <Charts properties={properties} transactions={transactions} />;
      case 'analytics':
        return <Analytics properties={properties} transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        currentView={view}
        onNavigate={setView}
        alertCount={stats.expiringContracts.length}
        onShowAlerts={() => setShowAlerts(true)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {showTransactionForm && selectedProperty && (
        <TransactionForm
          propertyId={selectedProperty.id}
          propertyName={`${selectedProperty.name} - ${selectedProperty.unit}`}
          onSubmit={handleAddTransaction}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {showAlerts && (
        <AlertsPanel
          properties={stats.expiringContracts}
          onClose={() => setShowAlerts(false)}
          onViewProperty={(property) => {
            setShowAlerts(false);
            handleViewProperty(property);
          }}
        />
      )}
    </div>
  );
}

export default App;
