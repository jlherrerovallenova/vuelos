import time
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Tuple, Dict, Any
import httpx
import fast_flights
from fast_flights.integrations.base import FetchIntegration
from fast_flights.querying import Query

from app.models.schemas import FlightOffer, FlightSegment, SearchRequest, NearbyAirportTip, PriceBreakdown
from app.services.airport_service import get_airport_by_code

# Simple in-memory cache with TTL to maximize performance and minimize requests
_CACHE: Dict[str, Tuple[float, List[FlightOffer]]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes

class GoogleFlightsCustomFetcher(FetchIntegration):
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
        }
        self.cookies = {
            # European Union Google Consent bypass cookie
            "SOCS": "CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3AwGgJlbiACGgYIgOnApgY",
            "CONSENT": "PENDING+999",
            "NID": "511=dummy"
        }

    def fetch_html(self, q: Query | str, /) -> str:
        params = q.params() if isinstance(q, Query) else {"q": q}
        with httpx.Client(
            headers=self.headers,
            cookies=self.cookies,
            follow_redirects=True,
            timeout=25.0
        ) as client:
            resp = client.get("https://www.google.com/travel/flights", params=params)
            return resp.text

_fetcher_instance = GoogleFlightsCustomFetcher()

def format_duration(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    return f"{mins}m"

def build_google_flights_url(origin: str, destination: str, date: str, return_date: Optional[str] = None) -> str:
    if return_date:
        return f"https://www.google.com/travel/flights?q=Flights%20to%20{destination}%20from%20{origin}%20on%20{date}%20through%20{return_date}"
    return f"https://www.google.com/travel/flights?q=Flights%20to%20{destination}%20from%20{origin}%20on%20{date}%20oneway"

def build_skyscanner_url(origin: str, destination: str, date: str, return_date: Optional[str] = None, passengers: int = 1, seat_class: str = "economy") -> str:
    def to_compact(d_str: str) -> str:
        parts = d_str.split("-")
        if len(parts) == 3:
            return f"{parts[0][2:]}{parts[1]}{parts[2]}"
        return d_str

    dep_c = to_compact(date)
    cabin = "economy" if seat_class == "economy" else "business"
    if return_date:
        ret_c = to_compact(return_date)
        return f"https://www.skyscanner.es/transporte/vuelos/{origin.lower()}/{destination.lower()}/{dep_c}/{ret_c}/?adultsv2={passengers}&cabinclass={cabin}"
    return f"https://www.skyscanner.es/transporte/vuelos/{origin.lower()}/{destination.lower()}/{dep_c}/?adultsv2={passengers}&cabinclass={cabin}"

def get_nearby_airport_tips(destination: str) -> List[NearbyAirportTip]:
    dest = destination.upper().strip()
    if dest == "FLR":
        return [
            NearbyAirportTip(
                code="PSA",
                city="Pisa",
                name="Aeropuerto de Pisa (Galileo Galilei)",
                transfer_info="Tren directo Pisa Centrale a Florencia SMN cada 20 min (49 min, ~9€)",
                estimated_savings="Vuelos directos desde 25€ (ahorro de hasta un 75% frente a FLR)"
            ),
            NearbyAirportTip(
                code="BLQ",
                city="Bolonia",
                name="Aeropuerto de Bolonia (Guglielmo Marconi)",
                transfer_info="Tren de alta velocidad Frecciarossa a Florencia (35 min, ~14€)",
                estimated_savings="Gran hub de conexiones y aerolíneas de bajo coste"
            )
        ]
    elif dest in ["PAR", "CDG", "ORY"]:
        return [
            NearbyAirportTip(
                code="BVA",
                city="París Beauvais",
                name="Beauvais-Tillé",
                transfer_info="Autobús directo a Porte Maillot (75 min, ~16€)",
                estimated_savings="Tarifas low-cost con Ryanair desde 15€"
            )
        ]
    elif dest in ["MIL", "MXP", "LIN"]:
        return [
            NearbyAirportTip(
                code="BGY",
                city="Milán Bérgamo",
                name="Bérgamo Orio al Serio",
                transfer_info="Autobús directo a Milano Centrale (50 min, ~10€)",
                estimated_savings="Principal base low-cost de Ryanair para Milán"
            )
        ]
    elif dest == "BRU":
        return [
            NearbyAirportTip(
                code="CRL",
                city="Bruselas Charleroi",
                name="Charleroi Sur",
                transfer_info="Shuttle bus directo a Bruselas Midi (55 min, ~17€)",
                estimated_savings="Vuelos ultra low-cost desde 19€"
            )
        ]
    elif dest == "VCE":
        return [
            NearbyAirportTip(
                code="TSF",
                city="Venecia Treviso",
                name="Treviso Sant'Angelo",
                transfer_info="Autobús directo a Piazzale Roma (40 min, ~12€)",
                estimated_savings="Base de Ryanair y Wizz Air para Venecia"
            )
        ]
    return []

def scrape_flights(req: SearchRequest) -> List[FlightOffer]:
    cache_key = f"{req.origin}_{req.destination}_{req.departure_date}_{req.trip_type}_{req.seat_class}_{req.passengers}_{req.max_stops}_{req.carry_on_bags}_{req.include_seat}"
    now = time.time()
    
    if cache_key in _CACHE:
        cached_time, cached_data = _CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    flights_result: List[FlightOffer] = []
    
    try:
        flight_queries = [
            fast_flights.FlightQuery(
                date=req.departure_date,
                from_airport=req.origin,
                to_airport=req.destination,
                max_stops=req.max_stops
            )
        ]
        
        if req.trip_type == "round-trip" and req.return_date:
            flight_queries.append(
                fast_flights.FlightQuery(
                    date=req.return_date,
                    from_airport=req.destination,
                    to_airport=req.origin,
                    max_stops=req.max_stops
                )
            )

        q = fast_flights.create_query(
            flights=flight_queries,
            seat=req.seat_class,
            trip=req.trip_type if req.trip_type in ["one-way", "round-trip"] else "one-way",
            passengers=fast_flights.Passengers(adults=req.passengers),
            currency="EUR",
            carry_on_bags=req.carry_on_bags,
            hide_separate_and_self_transfer=False  # Allow split-ticketing for maximum savings!
        )

        raw_results = fast_flights.get_flights(q, integration=_fetcher_instance)
        
        for item in raw_results:
            price_val = 0.0
            if hasattr(item, "price") and item.price is not None:
                try:
                    price_val = float(item.price)
                except (ValueError, TypeError):
                    price_val = 0.0

            if price_val <= 0:
                continue

            airlines_list = getattr(item, "airlines", []) or ["Aerolínea estándar"]
            carbon_info = getattr(item, "carbon", None)

            segments: List[FlightSegment] = []
            raw_legs = getattr(item, "flights", [])

            dep_str = "--:--"
            arr_str = "--:--"
            total_duration = 0

            if raw_legs:
                first_leg = raw_legs[0]
                last_leg = raw_legs[-1]

                # Departure time
                if hasattr(first_leg, "departure") and first_leg.departure:
                    dep_time = getattr(first_leg.departure, "time", None)
                    if dep_time and len(dep_time) >= 2:
                        dep_str = f"{dep_time[0]:02d}:{dep_time[1]:02d}"

                # Arrival time
                if hasattr(last_leg, "arrival") and last_leg.arrival:
                    arr_time = getattr(last_leg.arrival, "time", None)
                    if arr_time and len(arr_time) >= 2:
                        arr_str = f"{arr_time[0]:02d}:{arr_time[1]:02d}"

                # Process all segments
                for idx, leg in enumerate(raw_legs):
                    from_code = leg.from_airport.code if hasattr(leg, "from_airport") and leg.from_airport else req.origin
                    to_code = leg.to_airport.code if hasattr(leg, "to_airport") and leg.to_airport else req.destination
                    
                    leg_dep = "--:--"
                    if hasattr(leg, "departure") and leg.departure:
                        t = getattr(leg.departure, "time", None)
                        if t and len(t) >= 2:
                            leg_dep = f"{t[0]:02d}:{t[1]:02d}"

                    leg_arr = "--:--"
                    if hasattr(leg, "arrival") and leg.arrival:
                        t = getattr(leg.arrival, "time", None)
                        if t and len(t) >= 2:
                            leg_arr = f"{t[0]:02d}:{t[1]:02d}"

                    leg_duration = getattr(leg, "duration", 0) or 0
                    total_duration += leg_duration

                    leg_airline = airlines_list[min(idx, len(airlines_list) - 1)] if airlines_list else "Vuelo"
                    plane_type = getattr(leg, "plane_type", None)

                    from_item = get_airport_by_code(from_code)
                    to_item = get_airport_by_code(to_code)

                    segments.append(
                        FlightSegment(
                            from_airport=from_code,
                            from_name=from_item.name or from_code,
                            to_airport=to_code,
                            to_name=to_item.name or to_code,
                            departure_time=leg_dep,
                            arrival_time=leg_arr,
                            duration_mins=leg_duration,
                            duration_formatted=format_duration(leg_duration),
                            airline=leg_airline,
                            plane_type=plane_type
                        )
                    )

            if total_duration == 0:
                total_duration = 120  # fallback estimation

            stops_count = max(0, len(segments) - 1)
            is_direct = (stops_count == 0)

            passengers_cnt = max(1, req.passengers)
            tot_price = round(price_val, 2)
            per_pax = round(tot_price / passengers_cnt, 2)

            # Build direct Google booking link
            booking_link = build_google_flights_url(
                origin=req.origin,
                destination=req.destination,
                date=req.departure_date,
                return_date=req.return_date if req.trip_type == "round-trip" else None
            )

            # Build direct Skyscanner comparison link
            skyscanner_link = build_skyscanner_url(
                origin=req.origin,
                destination=req.destination,
                date=req.departure_date,
                return_date=req.return_date if req.trip_type == "round-trip" else None,
                passengers=passengers_cnt,
                seat_class=req.seat_class
            )

            carbon_str = None
            if carbon_info is not None:
                if hasattr(carbon_info, "emission") and carbon_info.emission is not None:
                    try:
                        carbon_str = f"{round(float(carbon_info.emission) / 1000)} kg CO₂"
                    except (ValueError, TypeError):
                        carbon_str = str(carbon_info)
                else:
                    carbon_str = str(carbon_info)

            # Luggage and seat cost transparency calculation
            LOW_COST_AIRLINES = {"ryanair", "vueling", "easyjet", "wizz", "volotea", "transavia", "eurowings", "norwegian"}
            is_low_cost = any(any(lc in a.lower() for lc in LOW_COST_AIRLINES) for a in airlines_list)
            legs_count = 2 if req.trip_type == "round-trip" else 1

            if req.carry_on_bags >= 1:
                carry_on_inc = True
                baggage_txt = "Maleta de cabina 10kg incluida en tarifa"
                carry_on_est = 0.0
                carry_on_note = "Precio oficial con maleta en cabina (verificado)"
            else:
                if is_low_cost:
                    carry_on_inc = False
                    baggage_txt = "Solo bolso personal (40x20x25 cm bajo asiento)"
                    carry_on_est = round(20.0 * legs_count, 2)
                    carry_on_note = f"Maleta de cabina NO incluida (+{int(carry_on_est)}€ aprox. si se añade en web)"
                else:
                    carry_on_inc = True
                    baggage_txt = "Incluye maleta de mano 10-12kg + bolso"
                    carry_on_est = 0.0
                    carry_on_note = "Maleta de cabina incluida gratis en tarifa estándar"

            if req.include_seat:
                seat_reserved = True
                seat_est = round(7.0 * legs_count, 2)
                seat_note = f"Reserva de asiento estándar (+{int(seat_est)}€ por {legs_count} trayecto{'s' if legs_count > 1 else ''})"
            else:
                seat_reserved = False
                seat_est = 0.0
                seat_note = "Asignación aleatoria gratis (0€ al hacer check-in)"

            final_per_pax = round(per_pax + seat_est, 2)
            final_tot = round(final_per_pax * passengers_cnt, 2)

            breakdown = PriceBreakdown(
                base_price_per_passenger=per_pax,
                carry_on_bags_count=req.carry_on_bags,
                carry_on_price_estimated=carry_on_est,
                carry_on_status="included" if carry_on_inc else "not_included",
                carry_on_note=carry_on_note,
                seat_reserved=seat_reserved,
                seat_price_estimated=seat_est,
                seat_note=seat_note,
                total_per_passenger=final_per_pax,
                total_group=final_tot
            )

            offer = FlightOffer(
                id=str(uuid.uuid4())[:8],
                price=final_per_pax,
                price_per_passenger=final_per_pax,
                total_price=final_tot,
                passengers_count=passengers_cnt,
                currency="EUR",
                airlines=airlines_list,
                departure_time=dep_str,
                arrival_time=arr_str,
                total_duration_mins=total_duration,
                total_duration_formatted=format_duration(total_duration),
                stops_count=stops_count,
                is_direct=is_direct,
                carbon_emissions=carbon_str,
                segments=segments,
                booking_url=booking_link,
                skyscanner_url=skyscanner_link,
                carry_on_included=carry_on_inc,
                baggage_policy=baggage_txt,
                price_breakdown=breakdown
            )
            flights_result.append(offer)

    except Exception as e:
        print(f"Scraper error for {req.origin}->{req.destination}: {str(e)}")

    # Sort results by price ascending
    flights_result.sort(key=lambda x: x.price)

    # Compute best badges: cheapest, fastest, best savings
    if flights_result:
        cheapest_price = flights_result[0].price
        flights_result[0].is_cheapest = True
        flights_result[0].savings_badge = "🔥 Mejor precio absoluto"

        fastest_flight = min(flights_result, key=lambda x: x.total_duration_mins)
        fastest_flight.is_fastest = True
        if not fastest_flight.savings_badge:
            fastest_flight.savings_badge = "⚡ Vuelo más rápido"

        # Check for direct flight deal
        direct_flights = [f for f in flights_result if f.is_direct]
        if direct_flights:
            cheapest_direct = direct_flights[0]
            if not cheapest_direct.savings_badge:
                cheapest_direct.savings_badge = "✨ Directo más barato"

    _CACHE[cache_key] = (now, flights_result)
    return flights_result
