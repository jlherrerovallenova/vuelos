from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException

from app.models.schemas import (
    SearchRequest,
    SearchResponse,
    AirportItem,
    FlexibleCalendarResponse,
    AnywhereResponse
)
from app.services.airport_service import search_airports, get_airport_by_code
from app.services.flight_scraper import scrape_flights
from app.services.flexible_search import get_flexible_calendar, explore_anywhere

router = APIRouter(prefix="/api", tags=["flights"])

@router.get("/airports/search", response_model=List[AirportItem])
def get_airports(q: str = Query("", description="Query for airport code, city or country")):
    return search_airports(q)

from app.services.flight_scraper import scrape_flights, get_nearby_airport_tips

@router.post("/flights/search", response_model=SearchResponse)
def search_flight_offers(req: SearchRequest):
    try:
        flights = scrape_flights(req)
        
        cheapest = flights[0].price if flights else None
        fastest = min([f.total_duration_mins for f in flights]) if flights else None
        tips = get_nearby_airport_tips(req.destination)

        return SearchResponse(
            origin=req.origin,
            destination=req.destination,
            departure_date=req.departure_date,
            total_results=len(flights),
            cheapest_price=cheapest,
            fastest_duration_mins=fastest,
            flights=flights,
            nearby_tips=tips if tips else None,
            search_timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar vuelos: {str(e)}")

@router.get("/flights/flexible-calendar", response_model=FlexibleCalendarResponse)
async def get_flexible_dates_calendar(
    origin: str = Query(..., description="Airport code origin"),
    destination: str = Query(..., description="Airport code destination"),
    date: str = Query(..., description="Center date YYYY-MM-DD"),
    days_range: int = Query(3, ge=1, le=5, description="Days range (+/-)")
):
    try:
        return await get_flexible_calendar(origin, destination, date, days_range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en calendario flexible: {str(e)}")

@router.get("/flights/explore-anywhere", response_model=AnywhereResponse)
async def get_anywhere_deals(
    origin: str = Query(..., description="Airport code origin"),
    date: str = Query(..., description="Departure date YYYY-MM-DD")
):
    try:
        return await explore_anywhere(origin, date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en búsqueda a cualquier destino: {str(e)}")
