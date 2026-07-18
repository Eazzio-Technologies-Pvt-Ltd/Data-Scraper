from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.db import get_db
from database.cache import make_cache_key, get_cached_result
import pandas as pd
import io
from datetime import date
from typing import Optional

router = APIRouter()

@router.get("/export")
async def export_csv(
    keyword:  str = Query(...),
    location: str = Query(...),
    cities:   Optional[str] = Query(None),
    types:    Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    cache_key = make_cache_key(keyword, location)
    results   = get_cached_result(db, cache_key) or []

    if cities:
        city_list = [c.strip() for c in cities.split(",")]
        results   = [r for r in results if r.get("city") in city_list]
    if types:
        type_list = [t.strip() for t in types.split(",")]
        results   = [r for r in results if r.get("type") in type_list]

    df = pd.DataFrame(results, columns=[
        "name","address","city","state","pincode",
        "phone","email","website","rating","type","maps_link"
    ])
    df.columns = [
        "Name","Address","City","State","Pincode",
        "Phone","Email","Website","Rating","Type","Google Maps Link"
    ]
    df = df.fillna("—")

    buf      = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    today    = date.today().strftime("%Y-%m-%d")
    filename = f"{keyword.lower()}_{location.lower().replace(' ','_')}_{today}.csv"

    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
