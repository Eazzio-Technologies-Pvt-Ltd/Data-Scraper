from pydantic import BaseModel, field_validator

class SearchRequest(BaseModel):
    keyword:  str
    location: str

    @field_validator("keyword", "location")
    @classmethod
    def must_not_be_blank(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
