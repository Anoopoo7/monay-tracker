import React, { useEffect, useState } from 'react';
import { Spend } from '../../types/money';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { AlertCircle, Trash2 } from 'lucide-react';
import { getSourceBalance } from '../../utils/calculations';

interface EditSpendBottomSheetProps {
  spend: Spend | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditSpendBottomSheet: React.FC<EditSpendBottomSheetProps> = ({
  spend,
  isOpen,
  onClose,
}) => {
  const { categories, sources, spends, updateSpend, deleteSpend } = useMoneyFlow();

  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (spend && isOpen) {
      setAmount(spend.amount.toString());
      setCategoryId(spend.categoryId);
      setSourceId(spend.sourceId);
      setDate(spend.date);
      setNote(spend.note || '');
      setErrorMsg(null);
      setShowConfirmDelete(false);
    }
  }, [spend, isOpen]);

  if (!spend) return null;

  const selectedSource = sources.find((s) => s.id === sourceId);
  const rawBalance = selectedSource ? getSourceBalance(selectedSource, spends) : 0;
  // If editing the spend under the same source, add back its current amount
  const availableForUpdate =
    spend.sourceId === sourceId ? rawBalance + spend.amount : rawBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a category');
      return;
    }
    if (!sourceId) {
      setErrorMsg('Please select a money source');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a date');
      return;
    }

    const res = updateSpend(spend.id, numericAmount, categoryId, sourceId, date, note);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to update spending');
    }
  };

  const handleDelete = () => {
    deleteSpend(spend.id);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Spending">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {showConfirmDelete ? (
          <div className="p-4 bg-red-950/90 border border-red-500 rounded-2xl space-y-3">
            <div className="text-sm font-semibold text-red-200">
              Are you sure you want to delete this spend transaction?
            </div>
            <p className="text-xs text-red-300">
              Amount: ₹{new Intl.NumberFormat('en-IN').format(spend.amount)}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Amount (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xl font-semibold focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-400">
                  Source <span className="text-red-400">*</span>
                </label>
                {selectedSource && (
                  <span className="text-[11px] text-slate-400">
                    Avail: <strong className="text-emerald-400">₹{new Intl.NumberFormat('en-IN').format(availableForUpdate)}</strong>
                  </span>
                )}
              </div>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                {sources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-3.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-400 rounded-xl transition flex items-center justify-center"
                aria-label="Delete Spend"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </form>
    </BottomSheet>
  );
};
