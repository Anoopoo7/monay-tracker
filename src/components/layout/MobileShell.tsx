import React from 'react';
import { Toast } from '../common/Toast';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-start antialiased text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* 390px Centered Viewport Shell */}
      <div className="w-full max-w-[390px] min-h-[100dvh] bg-slate-900 shadow-2xl relative flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] border-x border-slate-800/50">
        <Toast />
        <main className="flex-1 w-full overflow-y-auto px-4 py-4 space-y-5">
          {children}
        </main>
      </div>
    </div>
  );
};
