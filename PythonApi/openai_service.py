import instructor
from groq import AsyncGroq
from pydantic_settings import BaseSettings
from models import PersonalInfo


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
        
        # Create Groq client with Instructor
        groq_client = AsyncGroq(api_key=settings.groq_api_key)
        self.client = instructor.from_groq(groq_client, mode=instructor.Mode.JSON)
        self.model = settings.groq_model
    
    async def parse_personal_info(self, input_text: str) -> PersonalInfo:
        """Parse personal information from text using Instructor with structured output."""
        try:
            # Use Instructor to extract structured data directly
            personal_info = await self.client.chat.completions.create(
                model=self.model,
                response_model=PersonalInfo,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert at extracting personal information from text. Extract all available personal details including name, address components, phone number, and email address."
                    },
                    {
                        "role": "user", 
                        "content": f"Extract personal information from this text: {input_text}"
                    }
                ],
                temperature=0.0,
                max_tokens=300
            )
            
            print(f"Extracted personal info: {personal_info}")  # Debug output
            return personal_info
            
        except Exception as e:
            print(f"Error parsing personal info: {e}")
            # Return empty PersonalInfo object on error
            return PersonalInfo()


# Singleton instance
parser = None

def get_parser() -> DataParser:
    global parser
    if parser is None:
        parser = DataParser()
    return parser