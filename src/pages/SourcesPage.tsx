import React from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import { getSourceBalance, getSourceSpent } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Plus, Wallet } from 'lucide-react';
import { MoneySource } from '../types/money';

interface SourcesPageProps {
  onOpenAddSource: () => void;
  onSelectSource: (source: MoneySource) => void;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({
  onOpenAddSource,
  onSelectSource,
}) => {
  const { sources, spends, transfers } = useMoneyFlow();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Money Sources</h1>
          <p className="text-xs text-slate-400">Where money is currently kept</p>
        </div>
        <button
          onClick={onOpenAddSource}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-xs font-bold hover:bg-emerald-400 transition active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Source</span>
        </button>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="text-sm font-semibold text-slate-300">No Money Sources</div>
          <p className="text-xs text-slate-500">
            Add sources like Cash, SBI, HDFC, or ICICI Bank to track available funds.
          </p>
          <button
            onClick={onOpenAddSource}
            className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
          >
            Add Your First Money Source
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const spent = getSourceSpent(source.id, spends);
            const balance = getSourceBalance(source, spends, transfers);

            return (
              <div
                key={source.id}
                onClick={() => onSelectSource(source)}
                className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 transition cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{source.name}</h3>
                      <span className="text-[10px] text-slate-400">
                        Added: {formatCurrency(source.initialAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-800/80 pt-2.5">
                  <div className="bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Spent</span>
                    <span className="text-xs font-bold text-amber-400">
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Available</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatCurrency(balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
