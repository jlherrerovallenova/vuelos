import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Vercel Serverless path rewrite middleware:
# Restores original client URL from x-matched-path if Vercel rewrote the request to /api/index.py
@app.middleware("http")
async def vercel_rewrite_middleware(request: Request, call_next):
    matched_path = request.headers.get("x-matched-path")
    if matched_path and request.scope.get("path") == "/api/index.py":
        request.scope["path"] = matched_path
    return await call_next(request)

# Register API routes with and without /api prefix for maximum compatibility
app.include_router(flights_router, prefix="/api")
app.include_router(flights_router)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FlightFinder API"}

# Mount and serve frontend dist assets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_CANDIDATES = [
    os.path.abspath(os.path.join(BASE_DIR, "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist")),
    os.path.abspath(os.path.join(BASE_DIR, "dist")),
]

dist_dir = None
for candidate in DIST_CANDIDATES:
    if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        dist_dir = candidate
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # If client requested root or was rewritten to api/index.py by Vercel
        if full_path in ["", "api/index.py"]:
            return FileResponse(os.path.join(dist_dir, "index.html"))
        # Do not shadow API endpoints or Swagger docs
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        target = os.path.join(dist_dir, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "service": "FlightFinder Zero-Cost API",
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
