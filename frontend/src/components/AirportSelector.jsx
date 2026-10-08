import React, { useState, useEffect, useRef } from 'react';
import { Plane, MapPin, Search, X } from 'lucide-react';
import { searchAirports } from '../services/api';
import { getAirportInfo, registerAirport } from '../utils/airports';

export default function AirportSelector({
  label,
  value,
  onChange,
  placeholder = "Seleccionar aeropuerto...",
  icon: CustomIcon
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const selectedInfo = getAirportInfo(value);

  useEffect(() => {
    let active = true;
    const fetchList = async () => {
      setLoading(true);
      const res = await searchAirports(query);
      if (active) {
        setAirports(res);
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchList, query ? 150 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport) => {
    registerAirport(airport);
    onChange(airport.code, airport);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative flex-1 notranslate" translate="no" ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
        {CustomIcon ? <CustomIcon className="w-3.5 h-3.5 text-blue-600" /> : <MapPin className="w-3.5 h-3.5 text-blue-600" />}
        {label}
      </label>

      {/* Input button displaying selected airport */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-300 hover:border-blue-500 rounded-xl px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-all group shadow-xs"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            translate="no"
            className="notranslate min-w-[46px] h-9 px-2 rounded-lg bg-blue-100/80 border border-blue-200 flex items-center justify-center font-mono font-black text-blue-700 text-sm shrink-0 tracking-wider"
          >
            {value || "---"}
          </div>
          <div className="text-left truncate">
            {selectedInfo ? (
              <>
                <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                  <span className="notranslate" translate="no">{selectedInfo.city}</span>
                  <span className="text-xs font-mono font-semibold text-blue-600 notranslate" translate="no">({selectedInfo.code})</span>
                </div>
                <div className="text-xs text-slate-500 truncate font-medium">
                  {selectedInfo.name || selectedInfo.country || "Aeropuerto seleccionado"}
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-slate-400 text-sm truncate">
                  {placeholder}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Haz clic para buscar
                </div>
              </>
            )}
          </div>
        </div>

        <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
      </div>

      {/* Dropdown search modal */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70">
            <Search className="w-4 h-4 text-blue-600 ml-1" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe ciudad, país o código (ej. Madrid, BCN)..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick select popular hubs */}
          {!query && (
            <div className="p-3 border-b border-slate-100 bg-slate-50/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
                Destinos frecuentes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'MAD', city: 'Madrid' },
                  { code: 'BCN', city: 'Barcelona' },
                  { code: 'LON', city: 'Londres' },
                  { code: 'PAR', city: 'París' },
                  { code: 'ROM', city: 'Roma' },
                  { code: 'LIS', city: 'Lisboa' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-xs font-medium text-slate-700 border border-slate-200 transition-colors notranslate shadow-2xs"
                    translate="no"
                  >
                    <span className="font-bold mr-1 text-slate-900">{item.code}</span>
                    <span className="text-slate-500">{item.city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                Buscando aeropuertos...
              </div>
            ) : airports.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No se encontraron aeropuertos coincidentes.
              </div>
            ) : (
              airports.map((airport) => (
                <button
                  key={airport.code}
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-50/60 transition-colors notranslate ${
                    value === airport.code ? 'bg-blue-50 text-blue-700' : 'text-slate-800'
                  }`}
                  translate="no"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      {airport.code}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                        {airport.city}
                        <span className="text-xs font-normal text-slate-500">({airport.country})</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[280px]">
                        {airport.name}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
