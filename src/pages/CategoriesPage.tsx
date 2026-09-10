import React from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import {
  getCategoryPercentage,
  getCategoryRemaining,
  getCategorySpent,
  getCategoryStatus,
} from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { Category } from '../types/money';

interface CategoriesPageProps {
  onOpenAddCategory: () => void;
  onSelectCategory: (category: Category) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onOpenAddCategory,
  onSelectCategory,
}) => {
  const { categories, spends } = useMoneyFlow();

  const activeCategories = categories.filter((c) => !c.isCompleted);
  const completedCategories = categories.filter((c) => c.isCompleted);

  const renderCategoryCard = (category: Category) => {
    const spent = getCategorySpent(category.id, spends);
    const remaining = getCategoryRemaining(category, spends);
    const percentage = getCategoryPercentage(category, spends);
    const status = getCategoryStatus(percentage);

    const getBarColor = () => {
      if (category.isCompleted) return 'bg-emerald-600/70';
      if (status === 'exceeded') return 'bg-red-500';
      if (status === 'warning') return 'bg-amber-500';
      return 'bg-emerald-500';
    };

    return (
      <div
        key={category.id}
        onClick={() => onSelectCategory(category)}
        className={`p-4 rounded-2xl space-y-2.5 transition cursor-pointer active:scale-[0.99] border ${
          category.isCompleted
            ? 'bg-slate-900/60 border-slate-800/80 opacity-90'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white">{category.name}</h3>
            {category.isCompleted && (
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 rounded-full text-[10px] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Budget</span>
            <span className="text-sm font-bold text-slate-200">
              {formatCurrency(category.budget)}
            </span>
          </div>
        </div>

        {category.isCompleted && category.completedAt && (
          <div className="text-[11px] text-emerald-400 font-medium">
            Completed on {formatDate(category.completedAt)}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor()} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 text-center">
          <div className="bg-slate-800/50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Spent</span>
            <span className="text-xs font-semibold text-amber-400">
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Remaining</span>
            <span
              className={`text-xs font-semibold ${
                remaining < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Used</span>
            <span className="text-xs font-semibold text-slate-200">{percentage}%</span>
          </div>
        </div>

        {status === 'exceeded' && (
          <div className="p-2 bg-red-950/60 border border-red-900/60 text-red-300 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Budget exceeded by {formatCurrency(Math.abs(remaining))}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-xs text-slate-400">Track construction jobs & budgets</p>
        </div>
        <button
          onClick={onOpenAddCategory}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-xs font-bold hover:bg-emerald-400 transition active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Job</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="text-sm font-semibold text-slate-300">No Jobs Yet</div>
          <p className="text-xs text-slate-500">
            Create construction work categories like Painting, Tiling, or Electrical to monitor expenses against budgets.
          </p>
          <button
            onClick={onOpenAddCategory}
            className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
          >
            Create Your First Job
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Jobs Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Jobs ({activeCategories.length})
              </h2>
            </div>
            {activeCategories.length === 0 ? (
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                No active jobs. All jobs are completed.
              </div>
            ) : (
              <div className="space-y-3">
                {activeCategories.map((category) => renderCategoryCard(category))}
              </div>
            )}
          </div>

          {/* Completed Jobs Section */}
          {completedCategories.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed Jobs ({completedCategories.length})</span>
                </h2>
              </div>
              <div className="space-y-3">
                {completedCategories.map((category) => renderCategoryCard(category))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
