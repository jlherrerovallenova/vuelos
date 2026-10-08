const API_BASE = '/api';

export async function searchAirports(query = '') {
  try {
    const res = await fetch(`${API_BASE}/airports/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Error al buscar aeropuertos');
    return await res.json();
  } catch (err) {
    console.error('Error searchAirports:', err);
    return [];
  }
}

export async function searchFlights(searchParams) {
  const res = await fetch(`${API_BASE}/flights/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(searchParams),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al buscar vuelos');
  }
  return await res.json();
}

export async function getFlexibleCalendar(origin, destination, date, range = 3) {
  const res = await fetch(
    `${API_BASE}/flights/flexible-calendar?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&days_range=${range}`
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener calendario flexible');
  }
  return await res.json();
}

export async function getAnywhereDeals(origin, date) {
  const res = await fetch(
    `${API_BASE}/flights/explore-anywhere?origin=${encodeURIComponent(origin)}&date=${encodeURIComponent(date)}`
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al explorar destinos');
  }
  return await res.json();
}
