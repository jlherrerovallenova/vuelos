import React, { useState } from 'react';
import { Plane, Clock, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, Leaf, Luggage, Armchair } from 'lucide-react';

export default function FlightCard({ flight, origin, destination }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${
      flight.is_cheapest
        ? 'border-emerald-400/80 ring-1 ring-emerald-400/30'
        : flight.is_fastest
        ? 'border-blue-400/80 ring-1 ring-blue-400/30'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Top badges bar */}
      <div className="px-5 pt-3.5 pb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/40 rounded-t-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          {flight.savings_badge && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
              flight.is_cheapest
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {flight.savings_badge}
            </span>
          )}

          {flight.carry_on_included ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Luggage className="w-3.5 h-3.5 text-emerald-600" />
              Maleta 10kg incluida
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1" title="Esta tarifa básica solo incluye un bolso de mano bajo el asiento">
              <Luggage className="w-3.5 h-3.5 text-amber-700" />
              Solo mochila (+maleta ~20€)
            </span>
          )}

          {flight.price_breakdown?.seat_reserved && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              Asiento reservado
            </span>
          )}

          {flight.is_direct ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Vuelo Directo
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {flight.stops_count} {flight.stops_count === 1 ? 'Escala' : 'Escalas'}
            </span>
          )}

          {flight.carbon_emissions && (
            <span className="text-[10px] text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              <Leaf className="w-3 h-3 text-emerald-600" />
              {flight.carbon_emissions}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Tarifa directa oficial (0€ comisiones de agencia)
        </div>
      </div>

      {/* Main flight content */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Airline and times */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Airline info */}
          <div className="sm:w-36 shrink-0">
            <div className="font-extrabold text-slate-900 text-sm">
              {flight.airlines.join(' + ')}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
              <Plane className="w-3 h-3 text-blue-600" />
              {flight.segments.length > 0 && flight.segments[0].plane_type ? flight.segments[0].plane_type : 'Vuelo Comercial'}
            </div>
          </div>

          {/* Schedule timeline */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-left">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {flight.departure_time}
              </div>
              <div className="text-xs font-bold text-slate-500 notranslate font-mono" translate="no">
                {flight.segments.length > 0 ? flight.segments[0].from_airport : origin}
              </div>
            </div>

            {/* Visual flight progress line */}
            <div className="flex-1 flex flex-col items-center px-2">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {flight.total_duration_formatted}
              </div>
              <div className="w-full relative flex items-center">
                <div className="h-0.5 w-full bg-slate-200 rounded-full" />
                <Plane className="w-3.5 h-3.5 text-blue-600 absolute left-1/2 -translate-x-1/2 -top-1.5 rotate-90" />
                {!flight.is_direct && (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute left-1/2 -translate-x-1/2 -top-1 ring-2 ring-white" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                {flight.is_direct ? 'Directo' : `${flight.stops_count} escala`}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {flight.arrival_time}
              </div>
              <div className="text-xs font-bold text-slate-500 notranslate font-mono" translate="no">
                {flight.segments.length > 0 ? flight.segments[flight.segments.length - 1].to_airport : destination}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Price & booking action */}
        <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-between pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
          <div className="text-left md:text-right">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline md:justify-end gap-1">
              <span>{Math.round(flight.price_per_passenger || flight.price)}</span>
              <span className="text-xl text-blue-600 font-sans font-black">€</span>
            </div>
            <div className="text-[11px] text-slate-500 font-bold">
              por viajero {flight.price_breakdown?.seat_reserved ? '(con asiento)' : ''}
            </div>
            {flight.passengers_count > 1 && (
              <div className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mt-1 border border-slate-200/80">
                Total: {Math.round(flight.total_price || (flight.price * flight.passengers_count))}€ ({flight.passengers_count} viajeros)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-end">
            <a
              href={flight.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Google Flights</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {flight.skyscanner_url && (
              <a
                href={flight.skyscanner_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                title="Comparar tarifa en Skyscanner"
              >
                <span>Skyscanner</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse segments toggle */}
      {flight.segments && flight.segments.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-2.5 bg-slate-50/50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <span>{showDetails ? 'Ocultar desglose e itinerario' : 'Ver desglose precio real y escalas'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-slate-400 text-[11px] font-medium">
            {flight.segments.length} {flight.segments.length === 1 ? 'trayecto' : 'trayectos'}
          </span>
        </div>
      )}

      {/* Collapsible segments details & True Price Breakdown */}
      {showDetails && (
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl space-y-4">
          {/* Price breakdown box */}
          {flight.price_breakdown && (
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="font-extrabold text-slate-900 mb-2.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Desglose Transparente Precio Real
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Sin costes ocultos
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>✈️ Tarifa base del vuelo:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {Math.round(flight.price_breakdown.base_price_per_passenger)}€
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🧳 Maleta de cabina (10 kg):</span>
                  <span className={`font-semibold ${flight.carry_on_included ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {flight.carry_on_included ? '✓ Incluida en tarifa' : '⚠️ No incluida (~+20€ extra en web)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>💺 Elección de asiento:</span>
                  <span className="font-semibold text-slate-900">
                    {flight.price_breakdown.seat_reserved ? `✓ +${Math.round(flight.price_breakdown.seat_price_estimated)}€ (estándar)` : '0€ (aleatorio gratis)'}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center font-bold text-slate-900 text-sm">
                  <span>Total final por persona:</span>
                  <span className="font-mono text-blue-600 font-black">
                    {Math.round(flight.price_per_passenger)}€
                  </span>
                </div>
                {flight.passengers_count > 1 && (
                  <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                    <span>Total grupo ({flight.passengers_count} personas):</span>
                    <span className="font-mono text-blue-600 font-black">
                      {Math.round(flight.total_price)}€
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {flight.segments.map((seg, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-slate-300 space-y-1">
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 notranslate" translate="no">
                  {seg.from_airport} ({seg.from_name}) → {seg.to_airport} ({seg.to_name})
                </span>
                <span className="text-slate-600 font-mono font-medium">{seg.duration_formatted}</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span>Salida: <strong className="text-slate-900">{seg.departure_time}</strong></span>
                <span>Llegada: <strong className="text-slate-900">{seg.arrival_time}</strong></span>
                <span>Operado por: <strong className="text-slate-900">{seg.airline}</strong></span>
              </div>
              {seg.plane_type && (
                <div className="text-[11px] text-slate-500">
                  Aeronave: {seg.plane_type}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
