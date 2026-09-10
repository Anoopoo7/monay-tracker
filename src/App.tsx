import React, { useState } from 'react';
import { MoneyFlowProvider } from './context/MoneyFlowContext';
import { MobileShell } from './components/layout/MobileShell';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SourcesPage } from './pages/SourcesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddSpendBottomSheet } from './components/modals/AddSpendBottomSheet';
import { TransferMoneyBottomSheet } from './components/modals/TransferMoneyBottomSheet';
import { AddCategoryBottomSheet } from './components/modals/AddCategoryBottomSheet';
import { AddSourceBottomSheet } from './components/modals/AddSourceBottomSheet';
import { CategoryDetailModal } from './components/modals/CategoryDetailModal';
import { SourceDetailModal } from './components/modals/SourceDetailModal';
import { EditSpendBottomSheet } from './components/modals/EditSpendBottomSheet';
import { EditTransferBottomSheet } from './components/modals/EditTransferBottomSheet';
import { Category, MoneySource, Spend, Transfer } from './types/money';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Bottom sheets & modals state
  const [isAddSpendOpen, setIsAddSpendOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSource, setSelectedSource] = useState<MoneySource | null>(null);
  const [editingSpend, setEditingSpend] = useState<Spend | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <CategoriesPage
            onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        );
      case 'sources':
        return (
          <SourcesPage
            onOpenAddSource={() => setIsAddSourceOpen(true)}
            onSelectSource={(src) => setSelectedSource(src)}
          />
        );
      case 'history':
        return (
          <HistoryPage
            onEditSpend={(sp) => setEditingSpend(sp)}
            onEditTransfer={(tr) => setEditingTransfer(tr)}
          />
        );
      case 'settings':
        return <SettingsPage />;
      case 'home':
      default:
        return (
          <HomePage
            onOpenAddSpend={() => setIsAddSpendOpen(true)}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            onOpenAddSource={() => setIsAddSourceOpen(true)}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onSelectSource={(src) => setSelectedSource(src)}
            onEditSpend={(sp) => setEditingSpend(sp)}
            onNavigateToHistory={() => setActiveTab('history')}
            onNavigateToCategories={() => setActiveTab('categories')}
            onNavigateToSources={() => setActiveTab('sources')}
          />
        );
    }
  };

  return (
    <MobileShell>
      {renderActivePage()}

      {/* Sticky Bottom Navigation Bar & FAB (+) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddSpend={() => setIsAddSpendOpen(true)}
      />

      {/* Bottom Sheets & Modals */}
      <AddSpendBottomSheet
        isOpen={isAddSpendOpen}
        onClose={() => setIsAddSpendOpen(false)}
      />

      <TransferMoneyBottomSheet
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <AddCategoryBottomSheet
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />

      <AddSourceBottomSheet
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
      />

      <CategoryDetailModal
        category={selectedCategory}
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onEditSpend={(spendId) => {
          setSelectedCategory(null);
        }}
      />

      <SourceDetailModal
        source={selectedSource}
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(null)}
        onEditSpend={(spend) => {
          setSelectedSource(null);
          setEditingSpend(spend);
        }}
        onEditTransfer={(transfer) => {
          setSelectedSource(null);
          setEditingTransfer(transfer);
        }}
      />

      <EditSpendBottomSheet
        spend={editingSpend}
        isOpen={!!editingSpend}
        onClose={() => setEditingSpend(null)}
      />

      <EditTransferBottomSheet
        transfer={editingTransfer}
        isOpen={!!editingTransfer}
        onClose={() => setEditingTransfer(null)}
      />
    </MobileShell>
  );
};

export default function App() {
  return (
    <MoneyFlowProvider>
      <MainContent />
    </MoneyFlowProvider>
  );
}
