from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import countdowns, memos, tools, weather

ROOT_DIR = Path(__file__).resolve().parents[2]
WEB_DIR = ROOT_DIR / "web"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Campus Utility Hub Backend",
    description="实用工具聚合站后端 API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def disable_frontend_cache(request, call_next):
    response = await call_next(request)
    if request.url.path == "/" or request.url.path.startswith(("/css/", "/js/")):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "campus-utility-hub-backend"}


@app.get("/", include_in_schema=False)
def frontend_index():
    return FileResponse(WEB_DIR / "index.html")


app.include_router(memos.router)
app.include_router(countdowns.router)
app.include_router(tools.router)
app.include_router(weather.router)

app.mount("/css", StaticFiles(directory=WEB_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=WEB_DIR / "js"), name="js")
