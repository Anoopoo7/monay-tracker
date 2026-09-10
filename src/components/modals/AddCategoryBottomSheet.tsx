import React, { useEffect, useState } from 'react';
import { useMoneyFlow } from '../../context/MoneyFlowContext';
import { BottomSheet } from '../common/BottomSheet';
import { AlertCircle } from 'lucide-react';

interface AddCategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCategoryBottomSheet: React.FC<AddCategoryBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCategory } = useMoneyFlow();
  const [name, setName] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setBudget('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Category name is required');
      return;
    }

    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      setErrorMsg('Budget must be a valid number greater than or equal to 0');
      return;
    }

    const res = addCategory(trimmedName, numericBudget);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create category');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/80 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Category Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Painting Work"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Budget (₹) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base font-bold">
              ₹
            </span>
            <input
              type="number"
              step="any"
              placeholder="50,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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
            Create Category
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
