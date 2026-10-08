from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.flights import router as flights_router

app = FastAPI(
    title="FlightFinder Zero-Cost API",
    description="Motor de búsqueda de vuelos de bajo coste con web scraping automatizado y calendario de fechas flexibles",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and external frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "FlightFinder Zero-Cost API",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FlightFinder API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
