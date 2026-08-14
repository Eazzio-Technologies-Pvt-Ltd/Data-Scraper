from fastapi import APIRouter
from pydantic import BaseModel
from ai.summary import compute_stats, generate_summary

router = APIRouter()


class SummaryRequest(BaseModel):
    keyword: str
    location: str
    results: list


@router.post("/api/ai/summary")
async def get_ai_summary(request: SummaryRequest):
    stats = compute_stats(request.results, request.keyword, request.location)
    summary = generate_summary(stats)
    return {"summary": summary}
