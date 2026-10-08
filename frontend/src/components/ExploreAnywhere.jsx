import React from 'react';
import { Compass, Sparkles, ExternalLink, Plane, MapPin } from 'lucide-react';

export default function ExploreAnywhere({
  deals,
  loading,
  origin,
  onSelectDestination
}) {
  if (loading) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="w-5 h-5 text-blue-600 animate-spin" />
          <h2 className="text-xl font-bold text-slate-900">
            Escaneando las mejores ofertas desde {origin} a cualquier parte...
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-68 rounded-3xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <div className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            Modo "Cualquier Lugar"
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            Escapadas más baratas desde <span className="notranslate text-blue-600" translate="no">{origin}</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Destinos ordenados de menor a mayor precio para viajar al coste mínimo posible.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Precios verificados en tiempo real
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.destination_code}
            className="group relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-xs"
          >
            {/* Image background */}
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={deal.image_url}
                alt={deal.destination_city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Tag pill */}
              {deal.tag && (
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-800 uppercase tracking-wider shadow-sm">
                  {deal.tag}
                </div>
              )}

              {/* Destination badge */}
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                <div>
                  <div className="text-xl font-black text-white drop-shadow-md">
                    {deal.destination_city}
                  </div>
                  <div className="text-xs text-slate-200 flex items-center gap-1 font-medium drop-shadow-md">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {deal.destination_country} ({deal.destination_code})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-200 drop-shadow-md">
                    Desde
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono drop-shadow-md">
                    {Math.round(deal.min_price)}€
                  </div>
                </div>
              </div>
            </div>

            {/* Flight detail bar */}
            <div className="p-4 bg-white flex flex-col justify-between flex-1 space-y-3">
              <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
                <span className="truncate max-w-[140px] text-slate-700 font-semibold">{deal.airline}</span>
                <span className="text-slate-500">
                  {deal.is_direct ? 'Directo' : 'Escala'} ({deal.flight_duration})
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectDestination(deal.destination_code)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Ver Vuelos</span>
                </button>

                <a
                  href={deal.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 cursor-pointer"
                  title="Reservar oferta directa"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
