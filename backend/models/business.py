from pydantic import BaseModel
from typing import Optional

class BusinessModel(BaseModel):
    place_id:  Optional[str]   = None
    name:      str
    address:   Optional[str]   = None
    city:      Optional[str]   = None
    state:     Optional[str]   = None
    pincode:   Optional[str]   = None
    phone:     Optional[str]   = None
    email:     Optional[str]   = None
    website:   Optional[str]   = None
    rating:    Optional[float] = None
    type:      Optional[str]   = None
    maps_link: Optional[str]   = None

    class Config:
        from_attributes = True
