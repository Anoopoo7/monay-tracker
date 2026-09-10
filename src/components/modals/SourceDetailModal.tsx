import React, { useState } from 'react';
import { MoneySource } from '../../types/money';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { getSourceBalance, getSourceSpent, getSourceSpends } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface SourceDetailModalProps {
  source: MoneySource | null;
  isOpen: boolean;
  onClose: () => void;
  onEditSpend?: (spendId: string) => void;
}

export const SourceDetailModal: React.FC<SourceDetailModalProps> = ({
  source,
  isOpen,
  onClose,
  onEditSpend,
}) => {
  const { spends, categories, deleteSource, updateSource } = useMoneyFlow();

  const [isEditingSource, setIsEditingSource] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!source) return null;

  const spent = getSourceSpent(source.id, spends);
  const available = getSourceBalance(source, spends);
  const sourceSpends = getSourceSpends(source.id, spends);

  const handleStartEdit = () => {
    setEditName(source.name);
    setEditAmount(source.initialAmount.toString());
    setActionError(null);
    setIsEditingSource(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const numericAmount = parseFloat(editAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setActionError('Initial amount must be >= 0');
      return;
    }

    const res = updateSource(source.id, editName, numericAmount);
    if (res.success) {
      setIsEditingSource(false);
    } else {
      setActionError(res.error || 'Failed to update source');
    }
  };

  const handleDelete = () => {
    setActionError(null);
    const res = deleteSource(source.id);
    if (res.success) {
      onClose();
    } else {
      setActionError(res.error || 'Failed to delete money source');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={source.name}>
      <div className="space-y-4">
        {actionError && (
          <div className="p-3 bg-red-950/90 border border-red-500 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {isEditingSource ? (
          <form onSubmit={handleSaveEdit} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Edit Money Source
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Source Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Initial Money (₹)</label>
              <input
                type="number"
                step="any"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
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
                onClick={() => setIsEditingSource(false)}
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
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Available Balance
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(available)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleStartEdit}
                  className="p-2 text-slate-400 hover:text-white bg-slate-700/60 rounded-xl transition"
                  title="Edit Source"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/50 border border-red-900/40 rounded-xl transition"
                  title="Delete Source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Starting Money</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(source.initialAmount)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Spent</span>
                <span className="text-sm font-semibold text-amber-400">
                  {formatCurrency(spent)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Transactions ({sourceSpends.length})
          </h4>
          {sourceSpends.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800">
              No transactions made using this source yet
            </div>
          ) : (
            <div className="space-y-2">
              {sourceSpends.map((sp) => {
                const cat = categories.find((c) => c.id === sp.categoryId);
                return (
                  <div
                    key={sp.id}
                    onClick={() => onEditSpend && onEditSpend(sp.id)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">
                        {cat ? cat.name : 'Unknown Category'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {sp.note || 'No note'} · {formatDate(sp.date)}
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
