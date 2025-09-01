import os
from typing import Dict, Any
from groq import AsyncGroq
from pydantic_settings import BaseSettings


class GroqSettings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    
    class Config:
        env_file = ".env"


settings = GroqSettings()


class DataParser:
    def __init__(self):
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
    
    async def parse_personal_info(self, input_text: str) -> Dict[str, Any]:
        system_prompt = """You are a personal information parser. Extract personal information from the input text and return ONLY a JSON object.

        Extract these fields if present:
        - name: Full name
        - street: Street address
        - city: City name  
        - state: State/province
        - country: Country
        - zip_code: ZIP/postal code
        - phone_number: Phone number
        - email: Email address
        - confidence: Your confidence (0.0 to 1.0)

        CRITICAL: Return ONLY valid JSON. No other text or explanation.

        Example for "My name is John Doe, I live at 123 Oak St, Boston, MA, USA, 02101. Phone: 555-1234":
        {"name": "John Doe", "street": "123 Oak St", "city": "Boston", "state": "MA", "country": "USA", "zip_code": "02101", "phone_number": "555-1234", "email": null, "confidence": 0.9}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": input_text}
                ],
                temperature=0.0,
                max_tokens=200,
                top_p=1.0
            )
            
            result = response.choices[0].message.content.strip()
            print(f"Raw AI response: {result}")  # Debug output
            
            # Try to parse as JSON
            try:
                import json
                # Clean up the response to ensure it's valid JSON
                if result.startswith('```json'):
                    result = result.replace('```json', '').replace('```', '').strip()
                elif result.startswith('```'):
                    result = result.replace('```', '').strip()
                    
                parsed_data = json.loads(result)
                print(f"Parsed JSON: {parsed_data}")  # Debug output
                
                if not isinstance(parsed_data, dict):
                    raise ValueError("Response is not a dictionary")
                    
            except (json.JSONDecodeError, ValueError) as e:
                print(f"JSON parsing error: {e}, raw response: {result}")
                # Return empty structure with low confidence
                parsed_data = {
                    "name": None,
                    "street": None,
                    "city": None,
                    "state": None,
                    "country": None,
                    "zip_code": None,
                    "phone_number": None,
                    "email": None,
                    "confidence": 0.2
                }
            
            # Ensure all required fields exist
            required_fields = ["name", "street", "city", "state", "country", "zip_code", "phone_number", "email", "confidence"]
            for field in required_fields:
                if field not in parsed_data:
                    parsed_data[field] = None if field != "confidence" else 0.5
                
            return parsed_data
            
        except Exception as e:
            print(f"Error parsing personal info: {e}")
            # Return empty structure with error info
            return {
                "name": None,
                "street": None,
                "city": None,
                "state": None,
                "country": None,
                "zip_code": None,
                "phone_number": None,
                "email": None,
                "confidence": 0.0
            }


# Singleton instance
parser = None

def get_parser() -> DataParser:
    global parser
    if parser is None:
        parser = DataParser()
    return parser