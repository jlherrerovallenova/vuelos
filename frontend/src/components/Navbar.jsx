import React from 'react';
import { Plane } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Vuela<span className="text-blue-600">Barato</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                0€ API Cost
              </span>
            </div>
            <div className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Motor de extracción inteligente sin comisiones
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
