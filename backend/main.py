from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter
from routes.search import router as search_router
from routes.export import router as export_router
from database.db import init_db
from dotenv import load_dotenv
import os

load_dotenv()
init_db()

app     = FastAPI(title="BizScraper Pro API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/health")
def health():
    return {"status": "ok"}

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
origins = [o.strip() for o in origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}