import React from 'react';
import { ArrowUpDown, Filter, RotateCcw } from 'lucide-react';

export default function FlightFilters({
  flights,
  sortBy,
  setSortBy,
  stopsFilter,
  setStopsFilter,
  selectedAirline,
  setSelectedAirline,
  availableAirlines,
  onReset
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            Ordenar por:
          </span>
          {[
            { id: 'price_asc', label: 'Más barato' },
            { id: 'duration_asc', label: 'Más rápido' },
            { id: 'departure_asc', label: 'Hora salida' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSortBy(option.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                sortBy === option.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Stops filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Escalas:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'direct', label: 'Directo' },
            { id: '1_stop', label: 'Máx 1 escala' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStopsFilter(option.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                stopsFilter === option.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Airline filter */}
        {availableAirlines.length > 1 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las aerolíneas</option>
              {availableAirlines.map((air) => (
                <option key={air} value={air}>
                  {air}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors self-end md:self-auto cursor-pointer"
          title="Reiniciar filtros"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>
    </div>
  );
}
