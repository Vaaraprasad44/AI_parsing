from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any


class PersonalInfoRequest(BaseModel):
    input_text: str


class PersonalInfo(BaseModel):
    name: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None


class PersonalInfoResponse(BaseModel):
    input_text: str
    personal_info: PersonalInfo
    confidence: float