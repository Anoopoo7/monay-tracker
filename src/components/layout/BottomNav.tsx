import React from 'react';
import { Home, PieChart, Wallet, ReceiptText, Settings, Plus } from 'lucide-react';

export type TabType = 'home' | 'categories' | 'sources' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddSpend: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddSpend,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'categories' as TabType, label: 'Categories', icon: PieChart },
    { id: 'sources' as TabType, label: 'Sources', icon: Wallet },
    { id: 'history' as TabType, label: 'History', icon: ReceiptText },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Add Spend (+) Button */}
      <button
        onClick={onOpenAddSpend}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-200"
        aria-label="Add Spend"
      >
        <Plus className="w-8 h-8 stroke-[2.5]" />
      </button>

      {/* Sticky Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[390px] mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="grid grid-cols-5 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 min-h-[48px] ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-[11px] tracking-tight leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
