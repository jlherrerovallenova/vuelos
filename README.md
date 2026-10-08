# ✈️ VuelaBarato — Buscador Inteligente de Vuelos al Menor Coste

Una aplicación web completa y diseñada específicamente para encontrar **los vuelos más baratos posibles sin sorpresas**, combinando **scraping automatizado de alta velocidad (0€ en costes de APIs)** con tácticas avanzadas de ahorro (calendario de fechas flexibles, buscador a cualquier destino, trucos de aeropuertos alternativos y transparencia total de costes con maleta y asiento).

---

## 💡 Técnicas de Ahorro y Características Clave

1. **0€ en Suscripciones de APIs (Web Scraping Directo)**:
   - Extrae tarifas en tiempo real de inventarios globales oficiales (Google Flights) sin pagar cuotas a GDS (Amadeus, Sabre) ni APIs comerciales de pago por consulta (SerpApi, RapidAPI).
   - Incorpora bypass del consentimiento de cookies GDPR de la Unión Europea (`SOCS` cookie injection) para garantizar respuestas directas e instantáneas.
   - Caché en memoria inteligente para evitar consultas duplicadas y optimizar tiempos de respuesta.

2. **Modo Tarifa Real Anti-Sorpresas (Equipaje de Mano y Asiento)**:
   - Evita la trampa de las tarifas cebo de aerolíneas low-cost (vuelos de 20€ que se convierten en 100€ al añadir extras).
   - **Filtro nativo de Maleta de Cabina (10 kg)**: Consulta inventarios aplicando el suplemento de maleta en compartimento superior o seleccionando la tarifa bundle que ya la incluye (ej. Regular / Priority / Iberia).
   - **Elección de asiento estándar**: Estimación y cálculo directo de reserva frente a asignación aleatoria gratuita (0€ en check-in).
   - **Desglose transparente**: Muestra en cada tarjeta de vuelo la tarifa base, el suplemento de maleta, la butaca y el precio total cerrado por pasajero y grupo.

3. **Matriz de Fechas Flexibles (±3 Días)**:
   - Permite comparar en una sola búsqueda los precios de días anteriores y posteriores a la fecha seleccionada.
   - Detecta visualmente el "Día Valle" (martes y miércoles) donde las aerolíneas bajan los precios hasta un **45%** frente a fines de semana.

4. **Base de Datos Mundial de Aeropuertos (+7.800 Aeropuertos IATA)**:
   - Integración con base de datos mundial (`airportsdata`) con normalización de tildes y búsqueda por ciudad, país o código en español (ej. Florencia -> FLR, Pisa -> PSA, Venecia -> VCE, Milán -> MXP/BGY/LIN).

5. **Trucos de Aeropuertos Cercanos (Nearby Airport Hacks)**:
   - Sugiere alternativas inteligentes de aeropuertos secundarios con conexiones ferroviarias directas que reducen el coste del billete hasta un 75% (ej. volar a Pisa para visitar Florencia con tren directo de 49 min por ~9€).

6. **Doble Comparador Directo**:
   - Enlaces profundos de reserva directa tanto en **Google Flights** como en **Skyscanner** con los parámetros exactos de pasajeros, fechas y clase.
   - 0€ de gastos de intermediación ni comisiones de gestión de agencias de viajes online (OTAs).

---

## 🛠️ Stack Tecnológico

- **Backend**:
  - **Python 3.12**
  - **FastAPI**: Endpoints asíncronos y documentación interactiva OpenAPI/Swagger en `/docs`.
  - **fast-flights & httpx**: Motor de extracción y consulta de inventarios aéreos.
  - **airportsdata**: Base de datos de más de 7.800 aeropuertos mundiales con códigos IATA.
  - **Pydantic v2**: Validación y estructuración de esquemas de datos.
  - **ThreadPoolExecutor**: Búsqueda concurrente para el calendario flexible y destinos múltiples.

- **Frontend**:
  - **React 19** con **Vite 8**
  - **Tailwind CSS v4**: Interfaz limpia, luminosa, responsiva y temática editorial moderna de viajes.
  - **Tipografía**: Plus Jakarta Sans & JetBrains Mono (vía Google Fonts).
  - **Lucide React**: Iconografía moderna para itinerarios, aeropuertos, equipajes y escalas.
  - **Protección contra auto-traducción**: Atributos `translate="no"` en códigos IATA e itinerarios.

---

## 🚀 Cómo Ejecutar la Aplicación

### Opción 1: Con el script automático (Windows)
Haz doble clic en:
```cmd
start.bat
```
Esto abrirá los dos servicios en paralelo (FastAPI en `http://127.0.0.1:8000` y React Vite en `http://localhost:3000`).

### Opción 2: Manualmente

#### 1. Iniciar el Backend (FastAPI):
```powershell
cd c:\AppsAntigravity\BuscadorVuelos\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Iniciar el Frontend (React Vite):
```powershell
cd c:\AppsAntigravity\BuscadorVuelos\frontend
npm run dev
```

Abre tu navegador en:
```
http://localhost:3000
```

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio y disponibilidad |
| `GET` | `/api/airports/search?q={query}` | Búsqueda y autocompletado en más de 7.800 aeropuertos IATA |
| `POST` | `/api/flights/search` | Búsqueda de vuelos por origen, destino, fecha, pasajeros, maleta de cabina y asiento |
| `GET` | `/api/flights/flexible-calendar` | Matriz de precios de ±3 días alrededor de una fecha dada |
| `GET` | `/api/flights/explore-anywhere` | Escapadas más baratas ordenadas por precio hacia cualquier destino |
| `GET` | `/docs` | Interfaz interactiva Swagger UI |
