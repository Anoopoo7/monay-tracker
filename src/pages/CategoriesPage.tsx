import React from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import {
  getCategoryPercentage,
  getCategoryRemaining,
  getCategorySpent,
  getCategoryStatus,
} from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { AlertTriangle, Plus } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-xs text-slate-400">Track construction budgets</p>
        </div>
        <button
          onClick={onOpenAddCategory}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-xs font-bold hover:bg-emerald-400 transition active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="text-sm font-semibold text-slate-300">No Categories Yet</div>
          <p className="text-xs text-slate-500">
            Create construction work categories like Painting, Tiling, or Electrical to monitor expenses against budgets.
          </p>
          <button
            onClick={onOpenAddCategory}
            className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const spent = getCategorySpent(category.id, spends);
            const remaining = getCategoryRemaining(category, spends);
            const percentage = getCategoryPercentage(category, spends);
            const status = getCategoryStatus(percentage);

            const getBarColor = () => {
              if (status === 'exceeded') return 'bg-red-500';
              if (status === 'warning') return 'bg-amber-500';
              return 'bg-emerald-500';
            };

            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2.5 transition cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{category.name}</h3>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Budget</span>
                    <span className="text-sm font-bold text-slate-200">
                      {formatCurrency(category.budget)}
                    </span>
                  </div>
                </div>

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
          })}
        </div>
      )}
    </div>
  );
};
