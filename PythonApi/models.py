from pydantic import BaseModel, Field
from typing import Optional, Union


class PersonalInfoRequest(BaseModel):
    input_text: str


class PersonalInfo(BaseModel):
    """Structured personal information extracted from text or ID card image"""
    name: Optional[str] = Field(None, description="Full name of the person as shown on ID")
    street: Optional[str] = Field(None, description="Street address including number and street name")
    city: Optional[str] = Field(None, description="City name")
    state: Optional[str] = Field(None, description="State, province, or region")
    country: Optional[str] = Field(None, description="Country name")
    zip_code: Optional[str] = Field(None, description="ZIP code or postal code")
    phone_number: Optional[str] = Field(None, description="Phone number")
    email: Optional[str] = Field(None, description="Email address")
    date_of_birth: Optional[str] = Field(None, description="Date of birth from ID card")
    id_number: Optional[str] = Field(None, description="ID card or license number")
    expiration_date: Optional[str] = Field(None, description="ID expiration date")
    gender: Optional[str] = Field(None, description="Gender as listed on ID")


class PersonalInfoResponse(BaseModel):
    input_text: Optional[str] = None
    personal_info: PersonalInfo
    confidence: float = Field(description="Confidence score between 0 and 1")
    source_type: str = Field(description="Whether data came from 'text' or 'image'")