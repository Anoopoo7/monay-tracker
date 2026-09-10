import React, { useState } from 'react';
import { Category } from '../../types/money';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import {
  getCategoryPercentage,
  getCategoryRemaining,
  getCategorySpent,
  getCategorySpends,
  getCategoryStatus,
} from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface CategoryDetailModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEditSpend?: (spendId: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  isOpen,
  onClose,
  onEditSpend,
}) => {
  const { spends, sources, deleteCategory, updateCategory } = useMoneyFlow();

  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editBudget, setEditBudget] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!category) return null;

  const spent = getCategorySpent(category.id, spends);
  const remaining = getCategoryRemaining(category, spends);
  const percentage = getCategoryPercentage(category, spends);
  const status = getCategoryStatus(percentage);
  const categorySpends = getCategorySpends(category.id, spends);

  const handleStartEdit = () => {
    setEditName(category.name);
    setEditBudget(category.budget.toString());
    setActionError(null);
    setIsEditingCategory(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const numericBudget = parseFloat(editBudget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      setActionError('Budget must be >= 0');
      return;
    }

    const res = updateCategory(category.id, editName, numericBudget);
    if (res.success) {
      setIsEditingCategory(false);
    } else {
      setActionError(res.error || 'Failed to update category');
    }
  };

  const handleDelete = () => {
    setActionError(null);
    const res = deleteCategory(category.id);
    if (res.success) {
      onClose();
    } else {
      setActionError(res.error || 'Failed to delete category');
    }
  };

  const getStatusBadge = () => {
    if (status === 'exceeded') {
      const exceededAmount = Math.abs(remaining);
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold bg-red-950/80 border border-red-800 text-red-400 rounded-full">
          Budget exceeded by {formatCurrency(exceededAmount)}
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-950/80 border border-amber-800 text-amber-400 rounded-full">
          Warning: Near Limit
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full">
        On Track
      </span>
    );
  };

  const getBarColor = () => {
    if (status === 'exceeded') return 'bg-red-500';
    if (status === 'warning') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={category.name}>
      <div className="space-y-4">
        {actionError && (
          <div className="p-3 bg-red-950/90 border border-red-500 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {isEditingCategory ? (
          <form onSubmit={handleSaveEdit} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Edit Category
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Budget (₹)</label>
              <input
                type="number"
                step="any"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                required
              />
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCategory(false)}
                className="flex-1 py-2 bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Stats Card */
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>{getStatusBadge()}</div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleStartEdit}
                  className="p-2 text-slate-400 hover:text-white bg-slate-700/60 rounded-xl transition"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/50 border border-red-900/40 rounded-xl transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(category.budget)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Spent</span>
                <span className="text-sm font-semibold text-amber-400">
                  {formatCurrency(spent)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Remaining</span>
                <span
                  className={`text-sm font-semibold ${
                    remaining < 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>Usage</span>
                <span>{percentage}% used</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor()} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Transactions ({categorySpends.length})
          </h4>
          {categorySpends.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800">
              No transactions recorded for this category yet
            </div>
          ) : (
            <div className="space-y-2">
              {categorySpends.map((sp) => {
                const src = sources.find((s) => s.id === sp.sourceId);
                return (
                  <div
                    key={sp.id}
                    onClick={() => onEditSpend && onEditSpend(sp.id)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">
                        {sp.note || category.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {src ? src.name : 'Unknown Source'} · {formatDate(sp.date)}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-100">
                      {formatCurrency(sp.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
