from pydantic import BaseModel, Field
from typing import Optional


class PersonalInfoRequest(BaseModel):
    input_text: str


class PersonalInfo(BaseModel):
    """Structured personal information extracted from text"""
    name: Optional[str] = Field(None, description="Full name of the person")
    street: Optional[str] = Field(None, description="Street address including number and street name")
    city: Optional[str] = Field(None, description="City name")
    state: Optional[str] = Field(None, description="State, province, or region")
    country: Optional[str] = Field(None, description="Country name")
    zip_code: Optional[str] = Field(None, description="ZIP code or postal code")
    phone_number: Optional[str] = Field(None, description="Phone number")
    email: Optional[str] = Field(None, description="Email address")


class PersonalInfoResponse(BaseModel):
    input_text: str
    personal_info: PersonalInfo
    confidence: float = Field(description="Confidence score between 0 and 1")