from pydantic import BaseModel
from typing import List
from models.business import BusinessModel

class SearchResponse(BaseModel):
    keyword:      str
    location:     str
    result_count: int
    from_cache:   bool
    results:      List[BusinessModel]
