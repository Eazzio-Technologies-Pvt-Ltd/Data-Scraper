import os
from groq import Groq


def compute_stats(results: list, keyword: str, location: str) -> dict:
    """
    Derive aggregate stats from a list of business result dicts
    or Pydantic BusinessModel objects.
    Returns None if results is empty or None.
    """
    if not results:
        return None

    # Helper — works for both plain dicts and Pydantic models
    def _get(r, field):
        if isinstance(r, dict):
            return r.get(field)
        return getattr(r, field, None)

    # Unique cities (cap at 5)
    cities = list(
        dict.fromkeys(
            _get(r, "city") for r in results if _get(r, "city")
        )
    )[:5]

    # Unique business types (cap at 5)
    types = list(
        dict.fromkeys(
            _get(r, "type") for r in results if _get(r, "type")
        )
    )[:5]

    with_phone   = sum(1 for r in results if _get(r, "phone"))
    with_website = sum(1 for r in results if _get(r, "website"))

    # Average rating — only over entries that have a numeric rating
    ratings = [
        float(_get(r, "rating"))
        for r in results
        if _get(r, "rating") is not None
    ]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

    # Top 3 by rating descending
    rated = sorted(
        [r for r in results if _get(r, "rating") is not None],
        key=lambda r: float(_get(r, "rating")),
        reverse=True,
    )[:3]
    top_3 = [
        {
            "name":   _get(r, "name"),
            "rating": _get(r, "rating"),
            "city":   _get(r, "city"),
        }
        for r in rated
    ]

    return {
        "keyword":      keyword,
        "location":     location,
        "total":        len(results),
        "cities":       cities,
        "types":        types,
        "with_phone":   with_phone,
        "with_website": with_website,
        "avg_rating":   avg_rating,
        "top_3":        top_3,
    }


def generate_summary(stats: dict) -> str | None:
    """
    Ask Groq (llama-3.1-8b-instant) to write a 2-3 sentence
    professional summary of the search stats.
    Returns None on any error — graceful degradation ensures
    the search still works even if the LLM call fails.
    """
    if stats is None:
        return None

    cities_str = ", ".join(stats["cities"]) if stats["cities"] else "N/A"
    types_str  = ", ".join(stats["types"])  if stats["types"]  else "N/A"
    avg_str    = str(stats["avg_rating"]) if stats["avg_rating"] is not None else "N/A"

    prompt = f"""You are a business data analyst assistant.

A user searched for "{stats['keyword']}" in "{stats['location']}" and here are the results:

- Total results found: {stats['total']}
- Cities covered: {cities_str}
- Business types: {types_str}
- Results with phone number: {stats['with_phone']}
- Results with website: {stats['with_website']}
- Average rating: {avg_str}
- Top 3 by rating: {stats['top_3']}

Write a 2-3 sentence professional summary of these results.
Be specific — mention actual city names, counts, and top business names.
Do not use bullet points. Plain paragraph only."""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[ai_summary] Groq call failed: {e}")
        return None
