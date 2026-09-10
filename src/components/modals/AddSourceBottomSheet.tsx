import React, { useEffect, useState } from 'react';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { AlertCircle } from 'lucide-react';

interface AddSourceBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSourceBottomSheet: React.FC<AddSourceBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSource } = useMoneyFlow();
  const [name, setName] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setInitialAmount('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Source name is required');
      return;
    }

    const numericAmount = parseFloat(initialAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setErrorMsg('Initial amount must be a valid number greater than or equal to 0');
      return;
    }

    const res = addSource(trimmedName, numericAmount);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to add money source');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Money Source">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Source Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. SBI or Cash"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Initial / Added Money (₹) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base font-bold">
              ₹
            </span>
            <input
              type="number"
              step="any"
              placeholder="1,50,000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Add Money Source
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
