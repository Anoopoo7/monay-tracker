import React, { useEffect, useRef, useState } from 'react';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { getTodayInputDate } from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';
import { getSourceBalance } from '../../utils/calculations';

interface TransferMoneyBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferMoneyBottomSheet: React.FC<TransferMoneyBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { sources, spends, transfers, addTransfer } = useMoneyFlow();

  const [fromSourceId, setFromSourceId] = useState<string>('');
  const [toSourceId, setToSourceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayInputDate());
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setAmount('');
      setDate(getTodayInputDate());
      setNote('');
      if (sources.length >= 1) {
        setFromSourceId(sources[0].id);
      }
      if (sources.length >= 2) {
        setToSourceId(sources[1].id);
      } else if (sources.length === 1) {
        setToSourceId(sources[0].id);
      }
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, sources]);

  const selectedFromSource = sources.find((s) => s.id === fromSourceId);
  const selectedFromBalance = selectedFromSource
    ? getSourceBalance(selectedFromSource, spends, transfers)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }
    if (!fromSourceId) {
      setErrorMsg('Please select a source');
      return;
    }
    if (!toSourceId) {
      setErrorMsg('Please select a destination');
      return;
    }
    if (fromSourceId === toSourceId) {
      setErrorMsg('Source and destination must be different.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a date');
      return;
    }

    const res = addTransfer(fromSourceId, toSourceId, numericAmount, date, note);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to record transfer');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Transfer Money">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* From Source */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-slate-400">
              From <span className="text-red-400">*</span>
            </label>
            {selectedFromSource && (
              <span className="text-[11px] text-slate-400">
                Avail: <strong className="text-emerald-400">₹{new Intl.NumberFormat('en-IN').format(selectedFromBalance)}</strong>
              </span>
            )}
          </div>
          {sources.length === 0 ? (
            <div className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60">
              No money sources found. Please add a money source first.
            </div>
          ) : (
            <select
              value={fromSourceId}
              onChange={(e) => setFromSourceId(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              {sources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name} (₹{new Intl.NumberFormat('en-IN').format(getSourceBalance(src, spends, transfers))})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* To Source */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            To <span className="text-red-400">*</span>
          </label>
          <select
            value={toSourceId}
            onChange={(e) => setToSourceId(e.target.value)}
            className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
          >
            {sources.map((src) => (
              <option key={src.id} value={src.id}>
                {src.name}
              </option>
            ))}
          </select>
        </div>

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
              placeholder="10,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xl font-semibold focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>
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
            placeholder="e.g. ATM withdrawal"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={sources.length < 2}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-base rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Transfer Money
          </button>
          {sources.length < 2 && (
            <p className="text-[11px] text-amber-400 text-center mt-1.5">
              You need at least 2 money sources to perform a transfer.
            </p>
          )}
        </div>
      </form>
    </BottomSheet>
  );
};
