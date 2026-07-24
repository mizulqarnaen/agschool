import React from 'react';
import { Shield, Info } from 'lucide-react';

export const PublicFooter = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>AG School Public Transparency Portal &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>This portal displays event information, winners, and prize status only. Operational finances remain confidential.</span>
        </div>
      </div>
    </footer>
  );
};
