import React, { useEffect, useRef, useState } from 'react';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { getTodayInputDate } from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';
import { getSourceBalance } from '../../utils/calculations';

interface AddSpendBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSpendBottomSheet: React.FC<AddSpendBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, sources, spends, addSpend } = useMoneyFlow();

  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayInputDate());
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Set default dropdown options when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setAmount('');
      setDate(getTodayInputDate());
      setNote('');
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      if (sources.length > 0) {
        setSourceId(sources[0].id);
      }
      // Focus amount input
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, categories, sources]);

  const selectedSource = sources.find((s) => s.id === sourceId);
  const selectedSourceBalance = selectedSource ? getSourceBalance(selectedSource, spends) : 0;

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

    const res = addSpend(numericAmount, categoryId, sourceId, date, note);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to add spending');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Spending">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Amount (₹) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">
              ₹
            </span>
            <input
              ref={amountInputRef}
              type="number"
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xl font-semibold focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          {categories.length === 0 ? (
            <div className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60">
              No categories found. Please create a category first.
            </div>
          ) : (
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
          )}
        </div>

        {/* Source Select */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-slate-400">
              Source <span className="text-red-400">*</span>
            </label>
            {selectedSource && (
              <span className="text-[11px] text-slate-400">
                Avail: <strong className="text-emerald-400">₹{new Intl.NumberFormat('en-IN').format(selectedSourceBalance)}</strong>
              </span>
            )}
          </div>
          {sources.length === 0 ? (
            <div className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60">
              No money sources found. Please add a money source first.
            </div>
          ) : (
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              {sources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name} (₹{new Intl.NumberFormat('en-IN').format(getSourceBalance(src, spends))})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Input */}
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

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Paint and labour"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={categories.length === 0 || sources.length === 0}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-base rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Add Spending
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
