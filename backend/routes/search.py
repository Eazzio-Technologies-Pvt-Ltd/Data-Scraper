from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from database.db import get_db
from database.cache import make_cache_key, get_cached_result, save_to_cache
from services.google_places import search_places
from services.data_processor import process_results
from models.response import SearchResponse
from models.business import BusinessModel
from utils.limiter import limiter
from utils.recaptcha import verify_recaptcha


router = APIRouter()

@router.get("/search", response_model=SearchResponse)
@limiter.limit("10/minute")
async def search_businesses(
    request: Request,
    keyword:  str = Query(..., min_length=1),
    location: str = Query(..., min_length=1),
    recaptcha_token: str = Query(None),
    db: Session = Depends(get_db)
):
    # Verify reCAPTCHA token if provided
    if recaptcha_token is not None:
        is_valid = await verify_recaptcha(recaptcha_token)
        if not is_valid:
            raise HTTPException(status_code=400, detail="CAPTCHA verification failed")

    keyword  = keyword.strip()
    location = location.strip()
    if not keyword or not location:
        raise HTTPException(status_code=400, detail="keyword and location are required")

    cache_key = make_cache_key(keyword, location)
    cached    = get_cached_result(db, cache_key)

    if cached:
        cached_businesses = [BusinessModel(**b) for b in cached]
        return SearchResponse(
            keyword=keyword, location=location,
            result_count=len(cached), from_cache=True,
            results=cached_businesses,
        )

    try:
        raw     = search_places(keyword, location)
        results = process_results(raw)
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=503, detail=str(e))

    save_to_cache(db, keyword, location, cache_key, results)

    result_businesses = [BusinessModel(**b) for b in results]

    return SearchResponse(
        keyword=keyword, location=location,
        result_count=len(results), from_cache=False,
        results=result_businesses,
    )
