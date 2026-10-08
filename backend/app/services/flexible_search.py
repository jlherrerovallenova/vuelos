import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from app.models.schemas import (
    SearchRequest,
    FlexibleDayPrice,
    FlexibleCalendarResponse,
    AnywhereDeal,
    AnywhereResponse
)
from app.services.flight_scraper import scrape_flights, build_google_flights_url
from app.services.airport_service import get_airport_by_code

DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

# Popular explore destinations database with verified landmark travel images and tags
EXPLORE_DESTINATIONS = [
    {
        "code": "BCN",
        "city": "Barcelona",
        "country": "España",
        "tag": "Cultura y Playa",
        "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "PMI",
        "city": "Palma de Mallorca",
        "country": "España",
        "tag": "Playas y Calas",
        "image": "https://images.unsplash.com/photo-1566993850067-bb8df9c9807e?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "LON",
        "city": "Londres",
        "country": "Reino Unido",
        "tag": "Metrópolis & Museos",
        "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "ROM",
        "city": "Roma",
        "country": "Italia",
        "tag": "Historia Viva & Gastronomía",
        "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "PAR",
        "city": "París",
        "country": "Francia",
        "tag": "Romance & Arte",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "MIL",
        "city": "Milán",
        "country": "Italia",
        "tag": "Moda & Arquitectura",
        "image": "https://images.unsplash.com/photo-1543864080-6d6644ddcbd6?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "LIS",
        "city": "Lisboa",
        "country": "Portugal",
        "tag": "Miradores & Fado",
        "image": "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "OPO",
        "city": "Oporto",
        "country": "Portugal",
        "tag": "Vino & Ribera",
        "image": "https://images.unsplash.com/photo-1569959220744-ff553533f492?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "BER",
        "city": "Berlín",
        "country": "Alemania",
        "tag": "Vanguardia & Música",
        "image": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "DUB",
        "city": "Dublín",
        "country": "Irlanda",
        "tag": "Pubs & Tradición",
        "image": "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "VIE",
        "city": "Viena",
        "country": "Austria",
        "tag": "Palacios & Música Clásica",
        "image": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "PRG",
        "city": "Praga",
        "country": "Rep. Checa",
        "tag": "Cuento de Hadas",
        "image": "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "BUD",
        "city": "Budapest",
        "country": "Hungría",
        "tag": "Balnearios & Danubio",
        "image": "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=800&q=80"
    },
    {
        "code": "RAK",
        "city": "Marrakech",
        "country": "Marruecos",
        "tag": "Zocos Exóticos & Desierto",
        "image": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80"
    }
]

thread_pool = ThreadPoolExecutor(max_workers=6)

def _query_date_worker(req_dict: dict) -> tuple:
    req = SearchRequest(**req_dict)
    results = scrape_flights(req)
    min_price = results[0].price if results else None
    return req.departure_date, min_price, len(results)

async def get_flexible_calendar(
    origin: str,
    destination: str,
    center_date_str: str,
    days_range: int = 3
) -> FlexibleCalendarResponse:
    center_date = datetime.strptime(center_date_str, "%Y-%m-%d")
    date_tasks = []
    
    dates_to_check = []
    for offset in range(-days_range, days_range + 1):
        target_d = center_date + timedelta(days=offset)
        # Avoid dates in the past
        if target_d >= datetime.now() - timedelta(days=1):
            dates_to_check.append(target_d.strftime("%Y-%m-%d"))

    loop = asyncio.get_event_loop()
    futures = [
        loop.run_in_executor(
            thread_pool,
            _query_date_worker,
            {
                "origin": origin,
                "destination": destination,
                "departure_date": d,
                "trip_type": "one-way",
                "passengers": 1,
                "seat_class": "economy"
            }
        )
        for d in dates_to_check
    ]

    results = await asyncio.gather(*futures, return_exceptions=True)

    days_data: List[FlexibleDayPrice] = []
    lowest_price_overall = None
    cheapest_date = None

    for res in results:
        if isinstance(res, tuple):
            date_val, min_price, count = res
            dt = datetime.strptime(date_val, "%Y-%m-%d")
            day_name = f"{DAYS_ES[dt.weekday()]} {dt.day} {MONTHS_ES[dt.month - 1]}"

            if min_price is not None:
                if lowest_price_overall is None or min_price < lowest_price_overall:
                    lowest_price_overall = min_price
                    cheapest_date = date_val

            days_data.append(
                FlexibleDayPrice(
                    date=date_val,
                    day_name=day_name,
                    formatted_date=f"{dt.day} {MONTHS_ES[dt.month - 1]}",
                    min_price=min_price,
                    is_searched_date=(date_val == center_date_str),
                    flights_found=count
                )
            )

    # Flag lowest days
    if lowest_price_overall is not None:
        for day in days_data:
            if day.min_price == lowest_price_overall:
                day.is_lowest = True

    return FlexibleCalendarResponse(
        origin=origin,
        destination=destination,
        center_date=center_date_str,
        days=days_data,
        lowest_price_overall=lowest_price_overall,
        cheapest_date=cheapest_date
    )

def _query_destination_worker(origin: str, dest_item: dict, departure_date: str) -> Optional[AnywhereDeal]:
    dest_code = dest_item["code"]
    if dest_code == origin:
        return None

    req = SearchRequest(
        origin=origin,
        destination=dest_code,
        departure_date=departure_date,
        trip_type="one-way",
        passengers=1,
        seat_class="economy"
    )
    
    flights = scrape_flights(req)
    if not flights:
        return None

    cheapest_flight = flights[0]
    airport_info = get_airport_by_code(dest_code)

    return AnywhereDeal(
        destination_code=dest_code,
        destination_city=dest_item["city"],
        destination_country=dest_item["country"],
        airport_name=airport_info.name or dest_item["city"],
        min_price=cheapest_flight.price,
        currency="EUR",
        airline=cheapest_flight.airlines[0] if cheapest_flight.airlines else "Aerolínea low-cost",
        departure_date=departure_date,
        flight_duration=cheapest_flight.total_duration_formatted,
        is_direct=cheapest_flight.is_direct,
        booking_url=cheapest_flight.booking_url,
        tag=dest_item.get("tag"),
        image_url=dest_item.get("image")
    )

async def explore_anywhere(origin: str, departure_date: str, max_destinations: int = 8) -> AnywhereResponse:
    # Filter out current origin
    dest_list = [d for d in EXPLORE_DESTINATIONS if d["code"] != origin][:max_destinations]
    
    loop = asyncio.get_event_loop()
    futures = [
        loop.run_in_executor(
            thread_pool,
            _query_destination_worker,
            origin,
            dest,
            departure_date
        )
        for dest in dest_list
    ]

    results = await asyncio.gather(*futures, return_exceptions=True)
    deals: List[AnywhereDeal] = []

    for r in results:
        if isinstance(r, AnywhereDeal):
            deals.append(r)

    # Sort deals by price ascending
    deals.sort(key=lambda x: x.min_price)

    return AnywhereResponse(
        origin=origin,
        departure_date=departure_date,
        deals=deals,
        total_deals=len(deals)
    )
