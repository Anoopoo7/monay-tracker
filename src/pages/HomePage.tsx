import React, { useState } from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import {
  getAvailableMoney,
  getCategoryPercentage,
  getCategoryRemaining,
  getCategorySpent,
  getCategoryStatus,
  getSourceBalance,
  getTotalMoneyAdded,
  getTotalSpent,
} from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowUpRight, ChevronRight, Plus, Wallet, AlertTriangle, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { Category, MoneySource, Spend } from '../types/money';

interface HomePageProps {
  onOpenAddSpend: () => void;
  onOpenTransfer: () => void;
  onOpenAddCategory: () => void;
  onOpenAddSource: () => void;
  onSelectCategory: (category: Category) => void;
  onSelectSource: (source: MoneySource) => void;
  onEditSpend: (spend: Spend) => void;
  onNavigateToHistory: () => void;
  onNavigateToCategories: () => void;
  onNavigateToSources: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAddSpend,
  onOpenTransfer,
  onOpenAddCategory,
  onOpenAddSource,
  onSelectCategory,
  onSelectSource,
  onEditSpend,
  onNavigateToHistory,
  onNavigateToCategories,
  onNavigateToSources,
}) => {
  const { sources, spends, transfers, categories } = useMoneyFlow();

  // Single privacy memory state controlling Total Summary & Money Source card visibility
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);

  const totalAvailable = getAvailableMoney(sources, spends);
  const totalAdded = getTotalMoneyAdded(sources);
  const totalSpent = getTotalSpent(spends);

  const recentSpends = [...spends]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Header with Dual Quick Action Buttons: + Spend and ↔ Transfer */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Good morning
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">Money Flow</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenTransfer}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold hover:bg-blue-500/20 transition active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            onClick={onOpenAddSpend}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold hover:bg-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Spend</span>
          </button>
        </div>
      </div>

      {/* Large Hero Balance Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-emerald-400 uppercase tracking-wider">
          <span>Total Available</span>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
              Live Balance
            </span>
            {/* The ONLY privacy toggle button on the Home Page */}
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label={isBalanceVisible ? 'Hide balances' : 'Show balances'}
            >
              {isBalanceVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {isBalanceVisible ? formatCurrency(totalAvailable) : '₹••••••'}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">
              Money Added
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {isBalanceVisible ? formatCurrency(totalAdded) : '₹••••••'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">
              Total Spent
            </span>
            <span className="text-sm font-semibold text-amber-400">
              {isBalanceVisible ? formatCurrency(totalSpent) : '₹••••••'}
            </span>
          </div>
        </div>
      </div>

      {/* Where is my money? Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center space-x-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Where is my money?</span>
          </h2>
          <button
            onClick={onNavigateToSources}
            className="text-xs text-emerald-400 font-semibold flex items-center hover:underline"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {sources.length === 0 ? (
          <div
            onClick={onOpenAddSource}
            className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center cursor-pointer hover:border-emerald-500/50 transition"
          >
            <p className="text-xs text-slate-400">Add your first money source</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {sources.map((source) => {
              const balance = getSourceBalance(source, spends, transfers);
              return (
                <div
                  key={source.id}
                  onClick={() => onSelectSource(source)}
                  className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-1 transition cursor-pointer active:scale-[0.98]"
                >
                  <div className="text-xs font-semibold text-slate-300 truncate">
                    {source.name}
                  </div>
                  <div className="text-base font-bold text-white">
                    {isBalanceVisible ? formatCurrency(balance) : '₹••••••'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Construction Budget Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-bold text-slate-200 tracking-tight">
            Construction Budget
          </h2>
          <button
            onClick={onNavigateToCategories}
            className="text-xs text-emerald-400 font-semibold flex items-center hover:underline"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {categories.length === 0 ? (
          <div
            onClick={onOpenAddCategory}
            className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center cursor-pointer hover:border-emerald-500/50 transition"
          >
            <p className="text-xs text-slate-400">Create your first category</p>
          </div>
        ) : (
          <div className="space-y-2.5">
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
                  className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {category.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {formatCurrency(spent)} / {formatCurrency(category.budget)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor()} transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">
                      {percentage}% used
                    </span>

                    {status === 'exceeded' ? (
                      <span className="text-red-400 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Exceeded by {formatCurrency(Math.abs(remaining))}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {formatCurrency(remaining)} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Spending Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-bold text-slate-200 tracking-tight">Recent Spending</h2>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-emerald-400 font-semibold flex items-center hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {recentSpends.length === 0 ? (
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center">
            <p className="text-xs text-slate-500">No spending recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSpends.map((sp) => {
              const cat = categories.find((c) => c.id === sp.categoryId);
              const src = sources.find((s) => s.id === sp.sourceId);

              return (
                <div
                  key={sp.id}
                  onClick={() => onEditSpend(sp)}
                  className="p-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400 shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {cat ? cat.name : 'Category'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {src ? src.name : 'Source'} · {formatDate(sp.date)}
                      </div>
                      {sp.note && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {sp.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {formatCurrency(sp.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
