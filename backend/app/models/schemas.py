from typing import List, Optional
from pydantic import BaseModel, Field

class AirportItem(BaseModel):
    code: str
    city: str
    country: str
    name: str

class FlightSegment(BaseModel):
    from_airport: str
    from_name: str
    to_airport: str
    to_name: str
    departure_time: str
    arrival_time: str
    duration_mins: int
    duration_formatted: str
    airline: str
    plane_type: Optional[str] = None

class PriceBreakdown(BaseModel):
    base_price_per_passenger: float
    carry_on_bags_count: int = 0
    carry_on_price_estimated: float = 0.0
    carry_on_status: str = "included"  # "included", "not_included"
    carry_on_note: str = ""
    seat_reserved: bool = False
    seat_price_estimated: float = 0.0
    seat_note: str = ""
    total_per_passenger: float
    total_group: float

class FlightOffer(BaseModel):
    id: str
    price: float  # Display comparison price per passenger
    price_per_passenger: float
    total_price: float
    passengers_count: int = 1
    currency: str = "EUR"
    airlines: List[str]
    departure_time: str
    arrival_time: str
    total_duration_mins: int
    total_duration_formatted: str
    stops_count: int
    is_direct: bool
    is_cheapest: bool = False
    is_fastest: bool = False
    carbon_emissions: Optional[str] = None
    segments: List[FlightSegment]
    booking_url: str
    skyscanner_url: Optional[str] = None
    savings_badge: Optional[str] = None
    carry_on_included: bool = False
    baggage_policy: Optional[str] = None
    price_breakdown: Optional[PriceBreakdown] = None

class NearbyAirportTip(BaseModel):
    code: str
    city: str
    name: str
    transfer_info: str
    estimated_savings: str

class SearchRequest(BaseModel):
    origin: str = Field(..., example="MAD")
    destination: str = Field(..., example="BCN")
    departure_date: str = Field(..., example="2026-11-05")
    return_date: Optional[str] = None
    trip_type: str = Field("one-way", example="one-way")
    passengers: int = Field(1, ge=1, le=9)
    seat_class: str = Field("economy", example="economy")
    max_stops: Optional[int] = None
    carry_on_bags: int = Field(0, ge=0, le=2)
    include_seat: bool = Field(False)

class SearchResponse(BaseModel):
    origin: str
    destination: str
    departure_date: str
    total_results: int
    cheapest_price: Optional[float] = None
    fastest_duration_mins: Optional[int] = None
    flights: List[FlightOffer]
    nearby_tips: Optional[List[NearbyAirportTip]] = None
    search_timestamp: str

class FlexibleDayPrice(BaseModel):
    date: str
    day_name: str
    formatted_date: str
    min_price: Optional[float] = None
    is_lowest: bool = False
    is_searched_date: bool = False
    flights_found: int = 0

class FlexibleCalendarResponse(BaseModel):
    origin: str
    destination: str
    center_date: str
    days: List[FlexibleDayPrice]
    lowest_price_overall: Optional[float] = None
    cheapest_date: Optional[str] = None

class AnywhereDeal(BaseModel):
    destination_code: str
    destination_city: str
    destination_country: str
    airport_name: str
    min_price: float
    currency: str = "EUR"
    airline: str
    departure_date: str
    flight_duration: str
    is_direct: bool
    booking_url: str
    tag: Optional[str] = None
    image_url: Optional[str] = None

class AnywhereResponse(BaseModel):
    origin: str
    departure_date: str
    deals: List[AnywhereDeal]
    total_deals: int
