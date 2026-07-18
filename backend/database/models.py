from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SearchCache(Base):
    __tablename__ = "search_cache"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    keyword      = Column(String, nullable=False)
    location     = Column(String, nullable=False)
    cache_key    = Column(String, unique=True, nullable=False)
    result_json  = Column(Text, nullable=False)
    result_count = Column(Integer, default=0)
    created_at   = Column(DateTime, default=datetime.utcnow)
    expires_at   = Column(DateTime, nullable=False)

class Business(Base):
    __tablename__ = "businesses"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    cache_id   = Column(Integer, ForeignKey("search_cache.id", ondelete="CASCADE"))
    place_id   = Column(String, nullable=False)
    name       = Column(String, nullable=False)
    address    = Column(String)
    city       = Column(String)
    state      = Column(String)
    pincode    = Column(String)
    phone      = Column(String)
    email      = Column(String)
    website    = Column(String)
    rating     = Column(Float)
    type       = Column(String)
    maps_link  = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
