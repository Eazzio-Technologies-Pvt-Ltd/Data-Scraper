from pydantic import BaseModel
from typing import List, Optional
from models.business import BusinessModel

class SearchResponse(BaseModel):
    keyword:      str
    location:     str
    result_count: int
    from_cache:   bool
    results:      List[BusinessModel]
    summary:      Optional[str] = None
