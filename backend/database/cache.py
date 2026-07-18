import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.models import SearchCache, Business
import os

EXPIRY_HOURS = int(os.getenv("CACHE_EXPIRY_HOURS", 24))

def make_cache_key(keyword: str, location: str) -> str:
    raw = f"{keyword.lower().strip()}|{location.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()

def get_cached_result(db: Session, cache_key: str):
    entry = db.query(SearchCache).filter(
        SearchCache.cache_key == cache_key,
        SearchCache.expires_at > datetime.utcnow()
    ).first()
    if entry:
        return json.loads(entry.result_json)
    return None

def save_to_cache(db: Session, keyword: str, location: str, cache_key: str, results: list):
    expires = datetime.utcnow() + timedelta(hours=EXPIRY_HOURS)
    existing = db.query(SearchCache).filter(SearchCache.cache_key == cache_key).first()
    if existing:
        existing.result_json  = json.dumps(results)
        existing.result_count = len(results)
        existing.expires_at   = expires
        db.commit()
        return existing
    entry = SearchCache(
        keyword=keyword, location=location, cache_key=cache_key,
        result_json=json.dumps(results), result_count=len(results), expires_at=expires
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    for r in results:
        existing_biz = db.query(Business).filter(
            Business.place_id == r.get("place_id",""),
            Business.cache_id == entry.id
        ).first()
        if not existing_biz:
            biz = Business(cache_id=entry.id, **{k: r.get(k) for k in [
                "place_id","name","address","city","state","pincode",
                "phone","email","website","rating","type","maps_link"
            ]})
            db.add(biz)
    db.commit()
    return entry
