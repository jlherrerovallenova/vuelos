import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchForm from './components/SearchForm';
import FlexibleDateMatrix from './components/FlexibleDateMatrix';
import FlightCard from './components/FlightCard';
import FlightFilters from './components/FlightFilters';
import ExploreAnywhere from './components/ExploreAnywhere';
import SavingsHacksBanner from './components/SavingsHacksBanner';
import { searchFlights, getFlexibleCalendar, getAnywhereDeals } from './services/api';
import { Plane, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const defaultDeparture = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split('T')[0];
  }, []);

  const [origin, setOrigin] = useState('MAD');
  const [destination, setDestination] = useState('BCN');
  const [departureDate, setDepartureDate] = useState(defaultDeparture);
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('one-way');
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState('economy');
  const [enableFlexibleCalendar, setEnableFlexibleCalendar] = useState(true);
  const [carryOnBags, setCarryOnBags] = useState(0);
  const [includeSeat, setIncludeSeat] = useState(false);

  const [flights, setFlights] = useState([]);
  const [nearbyTips, setNearbyTips] = useState([]);
  const [calendarData, setCalendarData] = useState(null);
  const [anywhereDeals, setAnywhereDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [anywhereLoading, setAnywhereLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortBy, setSortBy] = useState('price_asc');
  const [stopsFilter, setStopsFilter] = useState('all');
  const [selectedAirline, setSelectedAirline] = useState('all');

  useEffect(() => {
    loadAnywhereDeals(origin, departureDate);
  }, []);

  const loadAnywhereDeals = async (orig, date) => {
    setAnywhereLoading(true);
    try {
      const res = await getAnywhereDeals(orig, date);
      setAnywhereDeals(res.deals || []);
    } catch (err) {
      console.error('Error fetching anywhere deals:', err);
    } finally {
      setAnywhereLoading(false);
    }
  };

  const handleSearch = async (e, customDate = null, customDest = null) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetDate = customDate || departureDate;
    const targetDest = customDest || destination;

    if (tripType === 'anywhere' && !customDest) {
      loadAnywhereDeals(origin, targetDate);
      return;
    }

    if (!origin || !targetDest) {
      setError('Por favor selecciona origen y destino.');
      return;
    }

    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const searchPayload = {
        origin,
        destination: targetDest,
        departure_date: targetDate,
        return_date: tripType === 'round-trip' ? returnDate : null,
        trip_type: tripType,
        passengers,
        seat_class: seatClass,
        carry_on_bags: carryOnBags,
        include_seat: includeSeat
      };

      const res = await searchFlights(searchPayload);
      setFlights(res.flights || []);
      setNearbyTips(res.nearby_tips || []);

      if (enableFlexibleCalendar && tripType === 'one-way') {
        loadCalendarMatrix(origin, targetDest, targetDate);
      } else {
        setCalendarData(null);
      }
    } catch (err) {
      setError(err.message || 'Error al buscar vuelos. Por favor intenta de nuevo.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarMatrix = async (orig, dest, date) => {
    setCalendarLoading(true);
    try {
      const calRes = await getFlexibleCalendar(orig, dest, date, 3);
      setCalendarData(calRes);
    } catch (err) {
      console.error('Error in calendar matrix:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSelectCalendarDate = (newDate) => {
    setDepartureDate(newDate);
    handleSearch(null, newDate, destination);
  };

  const handleSelectAnywhereDestination = (destCode) => {
    setDestination(destCode);
    setTripType('one-way');
    handleSearch(null, departureDate, destCode);
  };

  const handleResetFilters = () => {
    setSortBy('price_asc');
    setStopsFilter('all');
    setSelectedAirline('all');
  };

  const availableAirlines = useMemo(() => {
    const set = new Set();
    flights.forEach((f) => {
      f.airlines.forEach((a) => set.add(a));
    });
    return Array.from(set);
  }, [flights]);

  const filteredFlights = useMemo(() => {
    let result = [...flights];

    if (stopsFilter === 'direct') {
      result = result.filter((f) => f.is_direct);
    } else if (stopsFilter === '1_stop') {
      result = result.filter((f) => f.stops_count <= 1);
    }

    if (selectedAirline !== 'all') {
      result = result.filter((f) => f.airlines.includes(selectedAirline));
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'duration_asc') {
      result.sort((a, b) => a.total_duration_mins - b.total_duration_mins);
    } else if (sortBy === 'departure_asc') {
      result.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }

    return result;
  }, [flights, stopsFilter, selectedAirline, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Search form component */}
        <SearchForm
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          departureDate={departureDate}
          setDepartureDate={setDepartureDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          tripType={tripType}
          setTripType={setTripType}
          passengers={passengers}
          setPassengers={setPassengers}
          seatClass={seatClass}
          setSeatClass={setSeatClass}
          enableFlexibleCalendar={enableFlexibleCalendar}
          setEnableFlexibleCalendar={setEnableFlexibleCalendar}
          carryOnBags={carryOnBags}
          setCarryOnBags={setCarryOnBags}
          includeSeat={includeSeat}
          setIncludeSeat={setIncludeSeat}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Flexible Date Matrix */}
        {enableFlexibleCalendar && tripType === 'one-way' && (
          <div className="mt-8">
            <FlexibleDateMatrix
              calendarData={calendarData}
              selectedDate={departureDate}
              onSelectDate={handleSelectCalendarDate}
              loading={calendarLoading}
            />
          </div>
        )}

        {/* Flight Results Section */}
        {hasSearched && tripType !== 'anywhere' && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>Vuelos <span className="notranslate text-blue-600" translate="no">{origin}</span> → <span className="notranslate text-blue-600" translate="no">{destination}</span></span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                    {filteredFlights.length} opciones
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Fecha de salida: <span className="font-bold text-slate-800">{departureDate}</span>
                </p>
              </div>

              {flights.length > 0 && (
                <div className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Tarifas reales sin comisiones ocultas
                </div>
              )}
            </div>

            {/* Smart Nearby Airport Savings Hack (e.g. Pisa for Florence, Beauvais for Paris) */}
            {nearbyTips && nearbyTips.length > 0 && (
              <div className="mb-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-300/80 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    💡
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                      <span>Hack de Ahorro para {destination}: Aeropuerto Alternativo</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">Recomendado</span>
                    </h4>
                    <p className="text-xs text-amber-900/80 mb-3 font-medium">
                      Muchas aerolíneas de bajo coste operan en aeropuertos cercanos muy bien comunicados en tren o autobús:
                    </p>
                    <div className="space-y-2">
                      {nearbyTips.map((tip, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{tip.city}</span>
                              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">{tip.code}</span>
                              <span className="text-xs font-normal text-slate-500">— {tip.name}</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5 font-medium">
                              🚆 {tip.transfer_info} · <strong className="text-emerald-700 font-bold">{tip.estimated_savings}</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDestination(tip.code);
                              handleSearch(null, departureDate, tip.code);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-all shadow-2xs"
                          >
                            Ver Vuelos a {tip.code}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            {flights.length > 0 && (
              <FlightFilters
                flights={flights}
                sortBy={sortBy}
                setSortBy={setSortBy}
                stopsFilter={stopsFilter}
                setStopsFilter={setStopsFilter}
                selectedAirline={selectedAirline}
                setSelectedAirline={setSelectedAirline}
                availableAirlines={availableAirlines}
                onReset={handleResetFilters}
              />
            )}

            {/* Flight Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-xs" />
                ))}
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">
                  No se encontraron vuelos con los filtros aplicados
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-medium">
                  Prueba a ajustar las escalas, aerolíneas o selecciona otra fecha en el calendario flexible superior.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 shadow-xs"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    origin={origin}
                    destination={destination}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Explore Anywhere Section */}
        {(tripType === 'anywhere' || !hasSearched) && (
          <ExploreAnywhere
            deals={anywhereDeals}
            loading={anywhereLoading}
            origin={origin}
            onSelectDestination={handleSelectAnywhereDestination}
          />
        )}

        {/* Cost-saving methods and hacks info */}
        <SavingsHacksBanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">© 2026 VuelaBarato — Buscador de vuelos optimizado para el máximo ahorro.</p>
          <p className="mt-1">
            Precios obtenidos en tiempo real de inventarios oficiales. 0€ de gastos de intermediación.
          </p>
        </div>
      </footer>
    </div>
  );
}
