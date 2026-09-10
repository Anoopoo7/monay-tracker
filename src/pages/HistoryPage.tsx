import React, { useState } from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Filter, Search, X } from 'lucide-react';
import { Spend } from '../types/money';
import { FilterBottomSheet } from '../components/modals/FilterBottomSheet';

interface HistoryPageProps {
  onEditSpend: (spend: Spend) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onEditSpend }) => {
  const { spends, categories, sources } = useMoneyFlow();

  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedSource ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSource('');
    setStartDate('');
    setEndDate('');
    setSearchText('');
  };

  // Filter and sort transactions
  const filteredSpends = spends
    .filter((sp) => {
      if (selectedCategory && sp.categoryId !== selectedCategory) return false;
      if (selectedSource && sp.sourceId !== selectedSource) return false;

      if (startDate && new Date(sp.date) < new Date(startDate)) return false;
      if (endDate && new Date(sp.date) > new Date(endDate)) return false;

      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const cat = categories.find((c) => c.id === sp.categoryId);
        const src = sources.find((s) => s.id === sp.sourceId);
        const catName = cat ? cat.name.toLowerCase() : '';
        const srcName = src ? src.name.toLowerCase() : '';
        const note = sp.note ? sp.note.toLowerCase() : '';
        const amountStr = sp.amount.toString();

        return (
          catName.includes(query) ||
          srcName.includes(query) ||
          note.includes(query) ||
          amountStr.includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Spending History</h1>
          <p className="text-xs text-slate-400">Complete transaction records</p>
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            activeFiltersCount > 0
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by category, source, note..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 transition"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Active:</span>
          {selectedCategory && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] flex items-center space-x-1 border border-slate-700">
              <span>Cat: {categories.find((c) => c.id === selectedCategory)?.name}</span>
              <X
                className="w-3 h-3 text-slate-400 hover:text-white cursor-pointer"
                onClick={() => setSelectedCategory('')}
              />
            </span>
          )}
          {selectedSource && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] flex items-center space-x-1 border border-slate-700">
              <span>Src: {sources.find((s) => s.id === selectedSource)?.name}</span>
              <X
                className="w-3 h-3 text-slate-400 hover:text-white cursor-pointer"
                onClick={() => setSelectedSource('')}
              />
            </span>
          )}
          {(startDate || endDate) && (
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[11px] flex items-center space-x-1 border border-slate-700">
              <span>Date range</span>
              <X
                className="w-3 h-3 text-slate-400 hover:text-white cursor-pointer"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              />
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-emerald-400 font-semibold underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Spending Transactions List */}
      {filteredSpends.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">No spending transactions found</p>
          {activeFiltersCount > 0 || searchText ? (
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-400 font-bold underline"
            >
              Reset filters & search
            </button>
          ) : (
            <p className="text-[11px] text-slate-500">Tap + to add your first expense</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSpends.map((sp) => {
            const cat = categories.find((c) => c.id === sp.categoryId);
            const src = sources.find((s) => s.id === sp.sourceId);

            return (
              <div
                key={sp.id}
                onClick={() => onEditSpend(sp)}
                className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">
                      {cat ? cat.name : 'Unknown Category'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 font-medium rounded-md border border-slate-700/60">
                      {src ? src.name : 'Unknown Source'}
                    </span>
                  </div>
                  {sp.note && (
                    <div className="text-xs text-slate-300 mt-0.5">{sp.note}</div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-1">{formatDate(sp.date)}</div>
                </div>
                <div className="text-sm font-extrabold text-white text-right">
                  {formatCurrency(sp.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={handleResetFilters}
      />
    </div>
  );
};
