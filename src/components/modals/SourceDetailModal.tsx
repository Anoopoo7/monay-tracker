import React, { useState } from 'react';
import { MoneySource, Spend, Transfer } from '../../types/money';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import {
  getSourceBalance,
  getSourceSpent,
  getSourceTransferredIn,
  getSourceTransferredOut,
} from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Edit2, MoveRight, Trash2 } from 'lucide-react';

interface SourceDetailModalProps {
  source: MoneySource | null;
  isOpen: boolean;
  onClose: () => void;
  onEditSpend?: (spend: Spend) => void;
  onEditTransfer?: (transfer: Transfer) => void;
}

export const SourceDetailModal: React.FC<SourceDetailModalProps> = ({
  source,
  isOpen,
  onClose,
  onEditSpend,
  onEditTransfer,
}) => {
  const { spends, transfers, sources, categories, deleteSource, updateSource } = useMoneyFlow();

  const [isEditingSource, setIsEditingSource] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!source) return null;

  const spent = getSourceSpent(source.id, spends);
  const transferredIn = getSourceTransferredIn(source.id, transfers);
  const transferredOut = getSourceTransferredOut(source.id, transfers);
  const available = getSourceBalance(source, spends, transfers);

  // Combine spends and transfers for this source
  const sourceSpends = spends.filter((s) => s.sourceId === source.id);
  const sourceTransfers = transfers.filter(
    (t) => t.fromSourceId === source.id || t.toSourceId === source.id
  );

  type CombinedItem =
    | { type: 'spend'; data: Spend; timestamp: number }
    | { type: 'transfer_out'; data: Transfer; timestamp: number }
    | { type: 'transfer_in'; data: Transfer; timestamp: number };

  const combinedHistory: CombinedItem[] = [
    ...sourceSpends.map((s) => ({
      type: 'spend' as const,
      data: s,
      timestamp: new Date(s.date).getTime(),
    })),
    ...sourceTransfers.map((t) => ({
      type: t.fromSourceId === source.id ? ('transfer_out' as const) : ('transfer_in' as const),
      data: t,
      timestamp: new Date(t.date).getTime(),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

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
                <span className="text-[10px] text-slate-400 block uppercase">Money Added</span>
                <span className="text-xs font-semibold text-white">
                  {formatCurrency(source.initialAmount)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Spent</span>
                <span className="text-xs font-semibold text-amber-400">
                  {formatCurrency(spent)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Transferred Out</span>
                <span className="text-xs font-semibold text-blue-400">
                  {formatCurrency(transferredOut)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Transferred In</span>
                <span className="text-xs font-semibold text-emerald-400">
                  {formatCurrency(transferredIn)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            History ({combinedHistory.length})
          </h4>
          {combinedHistory.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800">
              No transactions recorded for this source yet
            </div>
          ) : (
            <div className="space-y-2">
              {combinedHistory.map((item, idx) => {
                if (item.type === 'spend') {
                  const cat = categories.find((c) => c.id === item.data.categoryId);
                  return (
                    <div
                      key={`spend-${item.data.id}-${idx}`}
                      onClick={() => onEditSpend && onEditSpend(item.data)}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">
                            ↓ {cat ? cat.name : 'Spend'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.data.note || 'No note'} · {formatDate(item.data.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-amber-400">
                        -{formatCurrency(item.data.amount)}
                      </div>
                    </div>
                  );
                } else if (item.type === 'transfer_out') {
                  const targetSrc = sources.find((s) => s.id === item.data.toSourceId);
                  return (
                    <div
                      key={`transfer-out-${item.data.id}-${idx}`}
                      onClick={() => onEditTransfer && onEditTransfer(item.data)}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                          <MoveRight className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">
                            ↗ Transfer to {targetSrc ? targetSrc.name : 'Source'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.data.note || 'Transfer'} · {formatDate(item.data.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-400">
                        -{formatCurrency(item.data.amount)}
                      </div>
                    </div>
                  );
                } else {
                  const fromSrc = sources.find((s) => s.id === item.data.fromSourceId);
                  return (
                    <div
                      key={`transfer-in-${item.data.id}-${idx}`}
                      onClick={() => onEditTransfer && onEditTransfer(item.data)}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">
                            ↙ Transfer from {fromSrc ? fromSrc.name : 'Source'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.data.note || 'Transfer'} · {formatDate(item.data.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-emerald-400">
                        +{formatCurrency(item.data.amount)}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
