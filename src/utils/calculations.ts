import { Category, CategoryStatus, MoneySource, Spend } from '../types/money';

/**
 * Calculate total money added across all sources
 */
export const getTotalMoneyAdded = (sources: MoneySource[]): number => {
  return sources.reduce((acc, source) => acc + (source.initialAmount || 0), 0);
};

/**
 * Calculate total spending across all transactions
 */
export const getTotalSpent = (spends: Spend[]): number => {
  return spends.reduce((acc, spend) => acc + (spend.amount || 0), 0);
};

/**
 * Calculate total available balance = Total Money Added - Total Spent
 */
export const getAvailableMoney = (sources: MoneySource[], spends: Spend[]): number => {
  return getTotalMoneyAdded(sources) - getTotalSpent(spends);
};

/**
 * Calculate total spent from a specific money source
 */
export const getSourceSpent = (sourceId: string, spends: Spend[]): number => {
  return spends
    .filter((spend) => spend.sourceId === sourceId)
    .reduce((acc, spend) => acc + (spend.amount || 0), 0);
};

/**
 * Calculate current available balance for a specific source
 */
export const getSourceBalance = (source: MoneySource, spends: Spend[]): number => {
  return (source.initialAmount || 0) - getSourceSpent(source.id, spends);
};

/**
 * Calculate total spent for a specific category
 */
export const getCategorySpent = (categoryId: string, spends: Spend[]): number => {
  return spends
    .filter((spend) => spend.categoryId === categoryId)
    .reduce((acc, spend) => acc + (spend.amount || 0), 0);
};

/**
 * Calculate remaining budget for a category (can be negative if exceeded)
 */
export const getCategoryRemaining = (category: Category, spends: Spend[]): number => {
  return (category.budget || 0) - getCategorySpent(category.id, spends);
};

/**
 * Calculate percentage of budget used (0 - N%)
 */
export const getCategoryPercentage = (category: Category, spends: Spend[]): number => {
  if (!category.budget || category.budget <= 0) {
    const spent = getCategorySpent(category.id, spends);
    return spent > 0 ? 100 : 0;
  }
  const spent = getCategorySpent(category.id, spends);
  return Math.round((spent / category.budget) * 100);
};

/**
 * Determine warning status based on budget percentage used:
 * - Below 80% -> 'normal'
 * - 80% to 100% -> 'warning'
 * - Above 100% -> 'exceeded'
 */
export const getCategoryStatus = (percentage: number): CategoryStatus => {
  if (percentage > 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'normal';
};

/**
 * Get all spending transactions for a specific category, sorted newest first
 */
export const getCategorySpends = (categoryId: string, spends: Spend[]): Spend[] => {
  return spends
    .filter((spend) => spend.categoryId === categoryId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get all spending transactions for a specific source, sorted newest first
 */
export const getSourceSpends = (sourceId: string, spends: Spend[]): Spend[] => {
  return spends
    .filter((spend) => spend.sourceId === sourceId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Check if a category has any existing spending transactions
 */
export const hasCategoryTransactions = (categoryId: string, spends: Spend[]): boolean => {
  return spends.some((spend) => spend.categoryId === categoryId);
};

/**
 * Check if a source has any existing spending transactions
 */
export const hasSourceTransactions = (sourceId: string, spends: Spend[]): boolean => {
  return spends.some((spend) => spend.sourceId === sourceId);
};
