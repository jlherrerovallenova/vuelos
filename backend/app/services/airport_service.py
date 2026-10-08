from typing import List, Dict, Optional
import unicodedata
import airportsdata
from app.models.schemas import AirportItem

# Load complete database of 7,800+ worldwide IATA airports
_WORLD_AIRPORTS: Dict[str, dict] = airportsdata.load('IATA')

# Country code translation to Spanish
COUNTRY_NAMES_ES: Dict[str, str] = {
    "ES": "España",
    "IT": "Italia",
    "FR": "Francia",
    "GB": "Reino Unido",
    "DE": "Alemania",
    "PT": "Portugal",
    "NL": "Países Bajos",
    "BE": "Bélgica",
    "CH": "Suiza",
    "AT": "Austria",
    "GR": "Grecia",
    "IE": "Irlanda",
    "PL": "Polonia",
    "CZ": "República Checa",
    "HU": "Hungría",
    "SE": "Suecia",
    "NO": "Noruega",
    "DK": "Dinamarca",
    "FI": "Finlandia",
    "US": "Estados Unidos",
    "CA": "Canadá",
    "MX": "México",
    "CO": "Colombia",
    "AR": "Argentina",
    "CL": "Chile",
    "PE": "Perú",
    "BR": "Brasil",
    "MA": "Marruecos",
    "TR": "Turquía",
    "EG": "Egipto",
    "AE": "Emiratos Árabes",
    "JP": "Japón",
    "TH": "Tailandia",
    "HR": "Croacia",
    "IS": "Islandia",
    "RO": "Rumanía",
    "BG": "Bulgaria",
    "CY": "Chipre",
    "MT": "Malta"
}

# Spanish & common multi-language aliases for cities and metropolitan groups
CITY_ALIASES: Dict[str, List[str] | str] = {
    # Italia
    "florencia": "FLR",
    "florence": "FLR",
    "firenze": "FLR",
    "peretola": "FLR",
    "roma": ["ROM", "FCO", "CIA"],
    "rome": ["ROM", "FCO", "CIA"],
    "milan": ["MIL", "MXP", "BGY", "LIN"],
    "milano": ["MIL", "MXP", "BGY", "LIN"],
    "venecia": ["VCE", "TSF"],
    "venice": ["VCE", "TSF"],
    "venezia": ["VCE", "TSF"],
    "napoles": "NAP",
    "naples": "NAP",
    "napoli": "NAP",
    "pisa": "PSA",
    "bolonia": "BLQ",
    "bologna": "BLQ",
    "palermo": "PMO",
    "catania": "CTA",
    "turin": "TRN",
    "torino": "TRN",
    "verona": "VRN",
    "bari": "BRI",
    "genova": "GOA",
    "cagliari": "CAG",

    # España
    "madrid": "MAD",
    "barcelona": "BCN",
    "malaga": "AGP",
    "alicante": "ALC",
    "valencia": "VLC",
    "sevilla": "SVQ",
    "bilbao": "BIO",
    "palma": "PMI",
    "mallorca": "PMI",
    "ibiza": "IBZ",
    "menorca": "MAH",
    "tenerife": ["TFS", "TFN"],
    "gran canaria": "LPA",
    "lanzarote": "ACE",
    "fuerteventura": "FUE",
    "santiago de compostela": "SCQ",
    "asturias": "OVD",
    "oviedo": "OVD",
    "gijon": "OVD",
    "santander": "SDR",
    "granada": "GRX",
    "coruña": "LCG",
    "vigo": "VGO",
    "zaragoza": "ZAZ",
    "almeria": "LEI",
    "jerez": "XRY",
    "san sebastian": "EAS",
    "pamplona": "PNA",

    # Reino Unido & Irlanda
    "londres": ["LON", "LHR", "LGW", "STN", "LTN"],
    "london": ["LON", "LHR", "LGW", "STN", "LTN"],
    "edimburgo": "EDI",
    "edinburgh": "EDI",
    "manchester": "MAN",
    "birmingham": "BHX",
    "dublin": "DUB",
    "glasgow": "GLA",
    "belfast": "BFS",

    # Francia
    "paris": ["PAR", "CDG", "ORY", "BVA"],
    "niza": "NCE",
    "nice": "NCE",
    "lyon": "LYS",
    "marsella": "MRS",
    "marseille": "MRS",
    "burdeos": "BOD",
    "bordeaux": "BOD",
    "toulouse": "TLS",
    "nantes": "NTE",
    "estrasburgo": "SXB",

    # Alemania, Austria & Suiza
    "berlin": "BER",
    "munich": "MUC",
    "münchen": "MUC",
    "francfort": "FRA",
    "frankfurt": "FRA",
    "hamburgo": "HAM",
    "dusseldorf": "DUS",
    "colonia": "CGN",
    "viena": "VIE",
    "wien": "VIE",
    "vienna": "VIE",
    "salzburgo": "SZG",
    "zurich": "ZRH",
    "ginebra": "GVA",
    "geneva": "GVA",
    "basilea": "BSL",
    "basel": "BSL",

    # Europa Central & Este
    "praga": "PRG",
    "prague": "PRG",
    "budapest": "BUD",
    "varsovia": "WAW",
    "warsaw": "WAW",
    "cracovia": "KRK",
    "krakow": "KRK",
    "bucarest": "OTP",
    "sofia": "SOF",
    "atenas": "ATH",
    "athens": "ATH",
    "estambul": "IST",
    "istanbul": "IST",

    # Portugal
    "lisboa": "LIS",
    "lisbon": "LIS",
    "oporto": "OPO",
    "porto": "OPO",
    "faro": "FAO",
    "madeira": "FNC",

    # Países Bajos, Bélgica & Nórdicos
    "amsterdam": "AMS",
    "eindhoven": "EIN",
    "rotterdam": "RTM",
    "bruselas": ["BRU", "CRL"],
    "brussels": ["BRU", "CRL"],
    "copenhague": "CPH",
    "copenhagen": "CPH",
    "estocolmo": "ARN",
    "stockholm": "ARN",
    "oslo": "OSL",
    "helsinki": "HEL",

    # América
    "nueva york": ["NYC", "JFK", "EWR", "LGA"],
    "new york": ["NYC", "JFK", "EWR", "LGA"],
    "miami": "MIA",
    "los angeles": "LAX",
    "san francisco": "SFO",
    "chicago": ["CHI", "ORD", "MDW"],
    "buenos aires": ["BUE", "EZE", "AEP"],
    "bogota": "BOG",
    "medellin": "MDE",
    "mexico": "MEX",
    "ciudad de mexico": "MEX",
    "cancun": "CUN",
    "santiago de chile": "SCL",
    "lima": "LIM",
    "sao paulo": ["SAO", "GRU", "CGH"]
}

# Curated names for city groups & prominent hubs
SPECIAL_GROUPS: Dict[str, AirportItem] = {
    "LON": AirportItem(code="LON", city="Londres (Todos)", country="Reino Unido", name="Todos los aeropuertos (Heathrow, Gatwick, Stansted, Luton)"),
    "PAR": AirportItem(code="PAR", city="París (Todos)", country="Francia", name="Todos los aeropuertos (CDG, Orly, Beauvais)"),
    "ROM": AirportItem(code="ROM", city="Roma (Todos)", country="Italia", name="Todos los aeropuertos (Fiumicino, Ciampino)"),
    "MIL": AirportItem(code="MIL", city="Milán (Todos)", country="Italia", name="Todos los aeropuertos (Malpensa, Bérgamo, Linate)"),
    "NYC": AirportItem(code="NYC", city="Nueva York (Todos)", country="Estados Unidos", name="Todos los aeropuertos (JFK, Newark, LaGuardia)"),
    "BUE": AirportItem(code="BUE", city="Buenos Aires (Todos)", country="Argentina", name="Todos los aeropuertos (Ezeiza, Aeroparque)"),
    "FLR": AirportItem(code="FLR", city="Florencia", country="Italia", name="Aeropuerto de Florencia-Peretola (Amerigo Vespucci)"),
    "VCE": AirportItem(code="VCE", city="Venecia", country="Italia", name="Aeropuerto Marco Polo de Venecia"),
    "PSA": AirportItem(code="PSA", city="Pisa", country="Italia", name="Aeropuerto Internacional Galileo Galilei"),
    "NAP": AirportItem(code="NAP", city="Nápoles", country="Italia", name="Aeropuerto Internacional de Nápoles-Capodichino"),
    "BLQ": AirportItem(code="BLQ", city="Bolonia", country="Italia", name="Aeropuerto de Bolonia Guglielmo Marconi"),
    "MAD": AirportItem(code="MAD", city="Madrid", country="España", name="Adolfo Suárez Madrid-Barajas"),
    "BCN": AirportItem(code="BCN", city="Barcelona", country="España", name="Josep Tarradellas Barcelona-El Prat"),
}

def _normalize(text: str) -> str:
    """Removes accents, lowercase, strips whitespace"""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    return "".join([c for c in nfkd if not unicodedata.combining(c)]).lower().strip()

def _format_airport_item(code: str, raw: dict) -> AirportItem:
    if code in SPECIAL_GROUPS:
        return SPECIAL_GROUPS[code]

    country_code = raw.get("country", "")
    country_name = COUNTRY_NAMES_ES.get(country_code, country_code)

    city_name = raw.get("city") or raw.get("name") or code
    airport_name = raw.get("name") or f"Aeropuerto de {city_name}"

    # Friendly Spanish names for specific cities if raw is in English
    if code == "FLR":
        city_name = "Florencia"
        airport_name = "Peretola (Amerigo Vespucci)"
    elif code == "PSA":
        city_name = "Pisa"
        airport_name = "Galileo Galilei"
    elif code == "VCE":
        city_name = "Venecia"
        airport_name = "Marco Polo"
    elif code == "MUC":
        city_name = "Múnich"
    elif code == "FRA":
        city_name = "Fráncfort"
    elif code == "VIE":
        city_name = "Viena"
    elif code == "PRG":
        city_name = "Praga"
    elif code == "WAW":
        city_name = "Varsovia"
    elif code == "KRK":
        city_name = "Cracovia"
    elif code == "GVA":
        city_name = "Ginebra"
    elif code == "ATH":
        city_name = "Atenas"
    elif code == "CPH":
        city_name = "Copenhague"
    elif code == "ARN":
        city_name = "Estocolmo"
    elif code == "EDI":
        city_name = "Edimburgo"

    return AirportItem(
        code=code,
        city=city_name,
        country=country_name,
        name=airport_name
    )

def search_airports(query: str, limit: int = 15) -> List[AirportItem]:
    if not query:
        # Default top airports
        top_codes = ["MAD", "BCN", "LON", "PAR", "ROM", "MIL", "FLR", "LIS", "BER", "NYC"]
        results = []
        for c in top_codes:
            if c in SPECIAL_GROUPS:
                results.append(SPECIAL_GROUPS[c])
            elif c in _WORLD_AIRPORTS:
                results.append(_format_airport_item(c, _WORLD_AIRPORTS[c]))
        return results[:limit]

    q_norm = _normalize(query)
    matches: List[AirportItem] = []
    seen_codes = set()

    # 1. Alias lookup (e.g. "florencia" -> "FLR", "roma" -> ["ROM", "FCO", "CIA"])
    if q_norm in CITY_ALIASES:
        target = CITY_ALIASES[q_norm]
        codes = target if isinstance(target, list) else [target]
        for c in codes:
            if c in seen_codes:
                continue
            if c in SPECIAL_GROUPS:
                matches.append(SPECIAL_GROUPS[c])
                seen_codes.add(c)
            elif c in _WORLD_AIRPORTS:
                matches.append(_format_airport_item(c, _WORLD_AIRPORTS[c]))
                seen_codes.add(c)

    # 2. Exact IATA code match (e.g. FLR, MAD, JFK)
    if len(q_norm) == 3:
        code_upper = query.strip().upper()
        if code_upper not in seen_codes:
            if code_upper in SPECIAL_GROUPS:
                matches.append(SPECIAL_GROUPS[code_upper])
                seen_codes.add(code_upper)
            elif code_upper in _WORLD_AIRPORTS:
                matches.append(_format_airport_item(code_upper, _WORLD_AIRPORTS[code_upper]))
                seen_codes.add(code_upper)

    # 3. Partial alias matches (e.g. "floren..." -> "florencia" -> FLR)
    for alias_key, target in CITY_ALIASES.items():
        if alias_key.startswith(q_norm) and alias_key != q_norm:
            codes = target if isinstance(target, list) else [target]
            for c in codes:
                if c not in seen_codes:
                    if c in SPECIAL_GROUPS:
                        matches.append(SPECIAL_GROUPS[c])
                        seen_codes.add(c)
                    elif c in _WORLD_AIRPORTS:
                        matches.append(_format_airport_item(c, _WORLD_AIRPORTS[c]))
                        seen_codes.add(c)

    # 4. Search in SPECIAL_GROUPS
    for code, item in SPECIAL_GROUPS.items():
        if code not in seen_codes:
            if q_norm in _normalize(item.city) or q_norm in _normalize(item.name) or q_norm in _normalize(item.country):
                matches.append(item)
                seen_codes.add(code)

    # 5. Search in all 7,800+ world airports
    # Priority A: City starts with query
    for code, data in _WORLD_AIRPORTS.items():
        if len(matches) >= limit:
            break
        if code in seen_codes:
            continue
        city = _normalize(data.get("city") or "")
        if city.startswith(q_norm):
            matches.append(_format_airport_item(code, data))
            seen_codes.add(code)

    # Priority B: Query in city, airport name, or country
    for code, data in _WORLD_AIRPORTS.items():
        if len(matches) >= limit:
            break
        if code in seen_codes:
            continue
        city = _normalize(data.get("city") or "")
        name = _normalize(data.get("name") or "")
        country = _normalize(data.get("country") or "")
        country_es = _normalize(COUNTRY_NAMES_ES.get(data.get("country", ""), ""))

        if q_norm in city or q_norm in name or q_norm in country or q_norm in country_es:
            matches.append(_format_airport_item(code, data))
            seen_codes.add(code)

    return matches[:limit]

def get_airport_by_code(code: str) -> AirportItem:
    code_upper = code.strip().upper()
    if code_upper in SPECIAL_GROUPS:
        return SPECIAL_GROUPS[code_upper]
    if code_upper in _WORLD_AIRPORTS:
        return _format_airport_item(code_upper, _WORLD_AIRPORTS[code_upper])
    return AirportItem(code=code_upper, city=code_upper, country="", name=f"Aeropuerto {code_upper}")
