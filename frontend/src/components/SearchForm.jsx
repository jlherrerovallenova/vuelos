import React from 'react';
import { ArrowLeftRight, Calendar, Users, PlaneTakeoff, PlaneLanding, Search, Sparkles, Compass, Luggage, Armchair, ShieldCheck } from 'lucide-react';
import AirportSelector from './AirportSelector';

export default function SearchForm({
  origin,
  setOrigin,
  destination,
  setDestination,
  departureDate,
  setDepartureDate,
  returnDate,
  setReturnDate,
  tripType,
  setTripType,
  passengers,
  setPassengers,
  seatClass,
  setSeatClass,
  enableFlexibleCalendar,
  setEnableFlexibleCalendar,
  carryOnBags,
  setCarryOnBags,
  includeSeat,
  setIncludeSeat,
  onSearch,
  loading
}) {
  const handleSwap = () => {
    if (tripType !== 'anywhere') {
      const temp = origin;
      setOrigin(destination);
      setDestination(temp);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative z-20">
      {/* Top tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setTripType('one-way')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tripType === 'one-way'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Solo Ida
          </button>
          <button
            type="button"
            onClick={() => setTripType('round-trip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tripType === 'round-trip'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ida y Vuelta
          </button>
          <button
            type="button"
            onClick={() => setTripType('anywhere')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tripType === 'anywhere'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            A Cualquier Lugar
          </button>
        </div>

        {/* Flexible dates toggle */}
        {tripType !== 'anywhere' && (
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors">
            <input
              type="checkbox"
              checked={enableFlexibleCalendar}
              onChange={(e) => setEnableFlexibleCalendar(e.target.checked)}
              className="rounded accent-blue-600 w-4 h-4 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Matriz de fechas ±3 días (Máx ahorro)
            </span>
          </label>
        )}
      </div>

      {/* Main input rows */}
      <form onSubmit={onSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5">
            <AirportSelector
              label="Origen"
              value={origin}
              onChange={(code) => setOrigin(code)}
              icon={PlaneTakeoff}
              placeholder="Origen (ej. MAD)"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              disabled={tripType === 'anywhere'}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center border border-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Intercambiar origen y destino"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-6">
            {tripType === 'anywhere' ? (
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Destino
                </label>
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-base shrink-0">
                    🌍
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900 text-sm">
                      A Cualquier Destino
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      Explorando automáticamente las escapadas más económicas
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AirportSelector
                label="Destino"
                value={destination}
                onChange={(code) => setDestination(code)}
                icon={PlaneLanding}
                placeholder="Destino (ej. BCN, LON)"
              />
            )}
          </div>
        </div>

        {/* Second row: Dates & Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end pt-2">
          {/* Departure Date */}
          <div className={tripType === 'round-trip' ? 'md:col-span-4' : 'md:col-span-6'}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Fecha de Salida
            </label>
            <input
              type="date"
              min={todayStr}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 hover:border-blue-400 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none transition-colors shadow-2xs"
            />
          </div>

          {/* Return Date (if round-trip) */}
          {tripType === 'round-trip' && (
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Fecha de Vuelta
              </label>
              <input
                type="date"
                min={departureDate || todayStr}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 hover:border-blue-400 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          )}

          {/* Passengers & Class */}
          <div className={tripType === 'round-trip' ? 'md:col-span-4' : 'md:col-span-6'}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Pasajeros y Clase
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Adulto' : 'Adultos'}
                  </option>
                ))}
              </select>

              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="economy">Turista</option>
                <option value="premium-economy">Premium</option>
                <option value="business">Business</option>
                <option value="first">Primera</option>
              </select>
            </div>
          </div>
        </div>

        {/* Third row: Luggage, Seat Selection & Search Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2">
          {/* Maleta de Cabina */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-blue-600" />
                Maleta Cabina (10 kg)
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${carryOnBags >= 1 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                {carryOnBags >= 1 ? 'Trolley incluido' : 'Solo mochila'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setCarryOnBags(0)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  carryOnBags === 0
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Solo mochila</span>
              </button>
              <button
                type="button"
                onClick={() => setCarryOnBags(1)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  carryOnBags >= 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>+Maleta 10 kg</span>
              </button>
            </div>
          </div>

          {/* Elección de Asiento */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-blue-600" />
                Elección de Asiento
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${includeSeat ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                {includeSeat ? '+7€ est. trayecto' : 'Gratis check-in'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setIncludeSeat(false)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !includeSeat
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Aleatorio (0€)</span>
              </button>
              <button
                type="button"
                onClick={() => setIncludeSeat(true)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  includeSeat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>Reservar asiento</span>
              </button>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/35 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : tripType === 'anywhere' ? (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Explorar Ofertas</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar Vuelos Baratos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
