import React from 'react';
import { Calendar, TrendingDown, Sparkles } from 'lucide-react';

export default function FlexibleDateMatrix({
  calendarData,
  selectedDate,
  onSelectDate,
  loading
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600 animate-spin" />
          <h3 className="font-bold text-slate-800 text-sm">
            Escaneando días alternativos para encontrar el precio mínimo...
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!calendarData || !calendarData.days || calendarData.days.length === 0) {
    return null;
  }

  const { days, lowest_price_overall, cheapest_date } = calendarData;
  const currentDayData = days.find((d) => d.date === selectedDate);
  const potentialSavings =
    currentDayData && currentDayData.min_price && lowest_price_overall
      ? Math.round(currentDayData.min_price - lowest_price_overall)
      : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              Calendario de Precios Flexibles (±3 Días)
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                Modo Ahorro
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Compara precios de días adyacentes para volar en el momento más económico.
            </p>
          </div>
        </div>

        {potentialSavings > 0 && cheapest_date && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            ¡Ahorra hasta {potentialSavings}€ volando el {cheapest_date}!
          </div>
        )}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isCheapest = day.is_lowest && day.min_price !== null;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`relative p-3.5 rounded-2xl border text-left transition-all duration-150 group flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/25 shadow-sm'
                  : isCheapest
                  ? 'bg-emerald-50/70 border-emerald-400 hover:border-emerald-500 hover:bg-emerald-100/60 shadow-2xs'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 shadow-2xs'
              }`}
            >
              {isCheapest && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider shadow-sm whitespace-nowrap">
                  MÁS BARATO
                </span>
              )}

              <div className="mb-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {day.day_name.split(' ')[0]}
                </div>
                <div className="text-xs font-black text-slate-800">
                  {day.formatted_date}
                </div>
              </div>

              <div className="mt-auto">
                {day.min_price !== null ? (
                  <div>
                    <div className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors font-mono">
                      {Math.round(day.min_price)}€
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {day.flights_found} {day.flights_found === 1 ? 'vuelo' : 'vuelos'}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Sin vuelos
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
