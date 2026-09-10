import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Category, MoneySource, Spend, Transfer } from '../types/money';
import { getSourceBalance, hasCategoryTransactions, hasSourceTransactions } from '../utils/calculations';
import {
  clearAllData,
  exportAppDataAsJSON,
  loadAppData,
  resetToSampleData,
  saveAppData,
  validateAndImportAppData,
} from '../utils/storage';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MoneyFlowContextType {
  data: AppData;
  categories: Category[];
  sources: MoneySource[];
  spends: Spend[];
  transfers: Transfer[];
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  addCategory: (name: string, budget: number) => { success: boolean; error?: string };
  updateCategory: (id: string, name: string, budget: number) => { success: boolean; error?: string };
  deleteCategory: (id: string) => { success: boolean; error?: string };
  addSource: (name: string, initialAmount: number) => { success: boolean; error?: string };
  updateSource: (id: string, name: string, initialAmount: number) => { success: boolean; error?: string };
  deleteSource: (id: string) => { success: boolean; error?: string };
  addSpend: (
    amount: number,
    categoryId: string,
    sourceId: string,
    date: string,
    note?: string
  ) => { success: boolean; error?: string };
  updateSpend: (
    id: string,
    amount: number,
    categoryId: string,
    sourceId: string,
    date: string,
    note?: string
  ) => { success: boolean; error?: string };
  deleteSpend: (id: string) => void;
  addTransfer: (
    fromSourceId: string,
    toSourceId: string,
    amount: number,
    date: string,
    note?: string
  ) => { success: boolean; error?: string };
  updateTransfer: (
    id: string,
    fromSourceId: string,
    toSourceId: string,
    amount: number,
    date: string,
    note?: string
  ) => { success: boolean; error?: string };
  deleteTransfer: (id: string) => void;
  exportData: () => void;
  importData: (jsonString: string) => { success: boolean; error?: string };
  resetData: () => void;
  clearData: () => void;
}

const MoneyFlowContext = createContext<MoneyFlowContextType | undefined>(undefined);

export const MoneyFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const updateStateAndStorage = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  // CATEGORIES
  const addCategory = (name: string, budget: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Category name is required' };
    }
    if (isNaN(budget) || budget < 0) {
      return { success: false, error: 'Budget must be greater than or equal to 0' };
    }
    const duplicate = data.categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `Category "${trimmedName}" already exists` };
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      budget,
      createdAt: new Date().toISOString(),
    };

    const updatedData: AppData = {
      ...data,
      categories: [...data.categories, newCategory],
    };

    updateStateAndStorage(updatedData);
    showToast(`Category "${trimmedName}" created`, 'success');
    return { success: true };
  };

  const updateCategory = (id: string, name: string, budget: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Category name is required' };
    }
    if (isNaN(budget) || budget < 0) {
      return { success: false, error: 'Budget must be greater than or equal to 0' };
    }
    const duplicate = data.categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `Category "${trimmedName}" already exists` };
    }

    const updatedCategories = data.categories.map((c) =>
      c.id === id ? { ...c, name: trimmedName, budget } : c
    );

    updateStateAndStorage({ ...data, categories: updatedCategories });
    showToast(`Category updated`, 'success');
    return { success: true };
  };

  const deleteCategory = (id: string) => {
    const target = data.categories.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Category not found' };

    if (hasCategoryTransactions(id, data.spends)) {
      return {
        success: false,
        error: `Cannot delete "${target.name}" because it has existing spending transactions.`,
      };
    }

    const updatedCategories = data.categories.filter((c) => c.id !== id);
    updateStateAndStorage({ ...data, categories: updatedCategories });
    showToast(`Category "${target.name}" deleted`, 'info');
    return { success: true };
  };

  // MONEY SOURCES
  const addSource = (name: string, initialAmount: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Source name is required' };
    }
    if (isNaN(initialAmount) || initialAmount < 0) {
      return { success: false, error: 'Initial amount must be greater than or equal to 0' };
    }
    const duplicate = data.sources.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `Money source "${trimmedName}" already exists` };
    }

    const newSource: MoneySource = {
      id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      initialAmount,
      createdAt: new Date().toISOString(),
    };

    const updatedData: AppData = {
      ...data,
      sources: [...data.sources, newSource],
    };

    updateStateAndStorage(updatedData);
    showToast(`Source "${trimmedName}" added`, 'success');
    return { success: true };
  };

  const updateSource = (id: string, name: string, initialAmount: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Source name is required' };
    }
    if (isNaN(initialAmount) || initialAmount < 0) {
      return { success: false, error: 'Initial amount must be greater than or equal to 0' };
    }
    const duplicate = data.sources.some(
      (s) => s.id !== id && s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `Money source "${trimmedName}" already exists` };
    }

    const updatedSources = data.sources.map((s) =>
      s.id === id ? { ...s, name: trimmedName, initialAmount } : s
    );

    updateStateAndStorage({ ...data, sources: updatedSources });
    showToast(`Source updated`, 'success');
    return { success: true };
  };

  const deleteSource = (id: string) => {
    const target = data.sources.find((s) => s.id === id);
    if (!target) return { success: false, error: 'Money source not found' };

    if (hasSourceTransactions(id, data.spends, data.transfers)) {
      return {
        success: false,
        error: `Cannot delete "${target.name}" because it has existing transactions or transfers.`,
      };
    }

    const updatedSources = data.sources.filter((s) => s.id !== id);
    updateStateAndStorage({ ...data, sources: updatedSources });
    showToast(`Source "${target.name}" deleted`, 'info');
    return { success: true };
  };

  // SPENDING
  const addSpend = (
    amount: number,
    categoryId: string,
    sourceId: string,
    date: string,
    note?: string
  ) => {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!categoryId) {
      return { success: false, error: 'Category is required' };
    }
    if (!sourceId) {
      return { success: false, error: 'Money source is required' };
    }
    if (!date) {
      return { success: false, error: 'Date is required' };
    }

    const source = data.sources.find((s) => s.id === sourceId);
    if (!source) {
      return { success: false, error: 'Selected money source not found' };
    }

    // Check available source balance (incorporating transfers!)
    const availableBalance = getSourceBalance(source, data.spends, data.transfers);
    if (amount > availableBalance) {
      const formattedBalance = new Intl.NumberFormat('en-IN').format(availableBalance);
      return {
        success: false,
        error: `Insufficient balance. ${source.name} has only ₹${formattedBalance} available.`,
      };
    }

    const newSpend: Spend = {
      id: `spend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount,
      categoryId,
      sourceId,
      date,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedData: AppData = {
      ...data,
      spends: [newSpend, ...data.spends],
    };

    updateStateAndStorage(updatedData);
    showToast(`Spending recorded successfully`, 'success');
    return { success: true };
  };

  const updateSpend = (
    id: string,
    amount: number,
    categoryId: string,
    sourceId: string,
    date: string,
    note?: string
  ) => {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!categoryId) {
      return { success: false, error: 'Category is required' };
    }
    if (!sourceId) {
      return { success: false, error: 'Money source is required' };
    }
    if (!date) {
      return { success: false, error: 'Date is required' };
    }

    const existingSpend = data.spends.find((s) => s.id === id);
    if (!existingSpend) {
      return { success: false, error: 'Spend transaction not found' };
    }

    const source = data.sources.find((s) => s.id === sourceId);
    if (!source) {
      return { success: false, error: 'Selected money source not found' };
    }

    // Evaluate available balance excluding existing spend being edited
    const spendsWithoutCurrent = data.spends.filter((s) => s.id !== id);
    const availableBalanceForUpdate = getSourceBalance(source, spendsWithoutCurrent, data.transfers);

    if (amount > availableBalanceForUpdate) {
      const formattedBalance = new Intl.NumberFormat('en-IN').format(availableBalanceForUpdate);
      return {
        success: false,
        error: `Insufficient balance. ${source.name} has only ₹${formattedBalance} available.`,
      };
    }

    const updatedSpends = data.spends.map((sp) =>
      sp.id === id
        ? {
            ...sp,
            amount,
            categoryId,
            sourceId,
            date,
            note: note?.trim() || undefined,
          }
        : sp
    );

    updateStateAndStorage({ ...data, spends: updatedSpends });
    showToast(`Spend transaction updated`, 'success');
    return { success: true };
  };

  const deleteSpend = (id: string) => {
    const updatedSpends = data.spends.filter((s) => s.id !== id);
    updateStateAndStorage({ ...data, spends: updatedSpends });
    showToast(`Spend transaction deleted`, 'info');
  };

  // TRANSFERS
  const addTransfer = (
    fromSourceId: string,
    toSourceId: string,
    amount: number,
    date: string,
    note?: string
  ) => {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!fromSourceId) {
      return { success: false, error: 'From source is required' };
    }
    if (!toSourceId) {
      return { success: false, error: 'To source is required' };
    }
    if (fromSourceId === toSourceId) {
      return { success: false, error: 'Source and destination must be different.' };
    }
    if (!date) {
      return { success: false, error: 'Date is required' };
    }

    const fromSource = data.sources.find((s) => s.id === fromSourceId);
    if (!fromSource) {
      return { success: false, error: 'From money source not found' };
    }

    const toSource = data.sources.find((s) => s.id === toSourceId);
    if (!toSource) {
      return { success: false, error: 'To money source not found' };
    }

    // Validate available balance in fromSource
    const availableBalance = getSourceBalance(fromSource, data.spends, data.transfers);
    if (amount > availableBalance) {
      const formattedBalance = new Intl.NumberFormat('en-IN').format(availableBalance);
      return {
        success: false,
        error: `Insufficient balance. ${fromSource.name} has only ₹${formattedBalance} available.`,
      };
    }

    const newTransfer: Transfer = {
      id: `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fromSourceId,
      toSourceId,
      amount,
      date,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedData: AppData = {
      ...data,
      transfers: [newTransfer, ...data.transfers],
    };

    updateStateAndStorage(updatedData);
    showToast(`Transfer recorded successfully`, 'success');
    return { success: true };
  };

  const updateTransfer = (
    id: string,
    fromSourceId: string,
    toSourceId: string,
    amount: number,
    date: string,
    note?: string
  ) => {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!fromSourceId) {
      return { success: false, error: 'From source is required' };
    }
    if (!toSourceId) {
      return { success: false, error: 'To source is required' };
    }
    if (fromSourceId === toSourceId) {
      return { success: false, error: 'Source and destination must be different.' };
    }
    if (!date) {
      return { success: false, error: 'Date is required' };
    }

    const existingTransfer = data.transfers.find((t) => t.id === id);
    if (!existingTransfer) {
      return { success: false, error: 'Transfer transaction not found' };
    }

    const fromSource = data.sources.find((s) => s.id === fromSourceId);
    if (!fromSource) {
      return { success: false, error: 'From money source not found' };
    }

    // Evaluate available balance excluding the current transfer being edited
    const transfersWithoutCurrent = data.transfers.filter((t) => t.id !== id);
    const availableBalanceForUpdate = getSourceBalance(fromSource, data.spends, transfersWithoutCurrent);

    if (amount > availableBalanceForUpdate) {
      const formattedBalance = new Intl.NumberFormat('en-IN').format(availableBalanceForUpdate);
      return {
        success: false,
        error: `Insufficient balance. ${fromSource.name} has only ₹${formattedBalance} available.`,
      };
    }

    const updatedTransfers = data.transfers.map((t) =>
      t.id === id
        ? {
            ...t,
            fromSourceId,
            toSourceId,
            amount,
            date,
            note: note?.trim() || undefined,
          }
        : t
    );

    updateStateAndStorage({ ...data, transfers: updatedTransfers });
    showToast(`Transfer transaction updated`, 'success');
    return { success: true };
  };

  const deleteTransfer = (id: string) => {
    const updatedTransfers = data.transfers.filter((t) => t.id !== id);
    updateStateAndStorage({ ...data, transfers: updatedTransfers });
    showToast(`Transfer transaction deleted`, 'info');
  };

  // BACKUP & RESTORE
  const exportData = () => {
    exportAppDataAsJSON(data);
    showToast(`Backup exported successfully`, 'success');
  };

  const importData = (jsonString: string) => {
    const result = validateAndImportAppData(jsonString);
    if (result.success && result.data) {
      setData(result.data);
      showToast(`Data restored successfully`, 'success');
      return { success: true };
    }
    showToast(result.error || 'Failed to import backup file', 'error');
    return { success: false, error: result.error };
  };

  const resetData = () => {
    const reset = resetToSampleData();
    setData(reset);
    showToast(`Reset to sample data`, 'info');
  };

  const clearData = () => {
    const cleared = clearAllData();
    setData(cleared);
    showToast(`All data cleared`, 'info');
  };

  return (
    <MoneyFlowContext.Provider
      value={{
        data,
        categories: data.categories,
        sources: data.sources,
        spends: data.spends,
        transfers: data.transfers,
        toast,
        showToast,
        hideToast,
        addCategory,
        updateCategory,
        deleteCategory,
        addSource,
        updateSource,
        deleteSource,
        addSpend,
        updateSpend,
        deleteSpend,
        addTransfer,
        updateTransfer,
        deleteTransfer,
        exportData,
        importData,
        resetData,
        clearData,
      }}
    >
      {children}
    </MoneyFlowContext.Provider>
  );
};

export const useMoneyFlow = () => {
  const context = useContext(MoneyFlowContext);
  if (!context) {
    throw new Error('useMoneyFlow must be used within a MoneyFlowProvider');
  }
  return context;
};
