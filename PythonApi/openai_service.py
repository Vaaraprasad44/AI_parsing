import instructor
import base64
from io import BytesIO
from PIL import Image
from groq import AsyncGroq
from openai import AsyncOpenAI
from pydantic_settings import BaseSettings
from models import PersonalInfo


class AISettings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    openai_api_key: str = ""
    openai_vision_model: str = "gpt-4o-mini"
    
    class Config:
        env_file = ".env"


settings = AISettings()


class DataParser:
    def __init__(self):
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        # Create Groq client with Instructor for text parsing
        groq_client = AsyncGroq(api_key=settings.groq_api_key)
        self.groq_client = instructor.from_groq(groq_client, mode=instructor.Mode.JSON)
        self.text_model = settings.groq_model
        self.vision_model = settings.groq_vision_model
        
        # Create separate Groq client for vision
        self.groq_vision_client = AsyncGroq(api_key=settings.groq_api_key)
    
    async def parse_personal_info_from_text(self, input_text: str) -> PersonalInfo:
        """Parse personal information from text using Instructor with structured output."""
        try:
            personal_info = await self.groq_client.chat.completions.create(
                model=self.text_model,
                response_model=PersonalInfo,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert at extracting personal information from text. Extract all available personal details including name, address components, phone number, email address, and any ID-related information."
                    },
                    {
                        "role": "user", 
                        "content": f"Extract personal information from this text: {input_text}"
                    }
                ],
                temperature=0.0,
                max_tokens=300
            )
            
            print(f"Extracted personal info from text: {personal_info}")
            return personal_info
            
        except Exception as e:
            print(f"Error parsing personal info from text: {e}")
            return PersonalInfo()
    
    async def parse_personal_info_from_image(self, image_bytes: bytes) -> PersonalInfo:
        """Parse personal information from ID card image using Groq vision model."""
        try:
            print(f"Processing image: {len(image_bytes)} bytes")
            
            # Convert image to base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            print(f"Base64 image length: {len(base64_image)}")
            print(f"Base64 preview: {base64_image[:100]}...")
            
            # Use Groq vision model to extract information
            response = await self.groq_vision_client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting personal information from identification cards and documents. Extract all visible information including name, address, dates, ID numbers, and any other personal details. Return the information in a structured JSON format."
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract all personal information from this ID card or identification document. Include name, address, date of birth, ID number, expiration date, and any other visible details."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0.0,
                max_tokens=500
            )
            
            # Parse the response manually since we can't use Instructor with vision models yet
            result_text = response.choices[0].message.content
            print(f"Raw vision model response: {result_text}")
            
            # Use the text parser to structure the extracted text
            personal_info = await self.parse_personal_info_from_text(result_text)
            print(f"Extracted personal info from image: {personal_info}")
            
            return personal_info
            
        except Exception as e:
            print(f"Error parsing personal info from image: {e}")
            return PersonalInfo()
    
    def _resize_image_if_needed(self, image_bytes: bytes, max_size_mb: float = 4.0) -> bytes:
        """Resize image if it exceeds the maximum size for API."""
        try:
            image = Image.open(BytesIO(image_bytes))
            
            # Check if image needs resizing
            current_size_mb = len(image_bytes) / (1024 * 1024)
            if current_size_mb <= max_size_mb:
                return image_bytes
            
            # Calculate resize ratio
            ratio = (max_size_mb / current_size_mb) ** 0.5
            new_width = int(image.width * ratio)
            new_height = int(image.height * ratio)
            
            # Resize and compress
            resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save to bytes
            output = BytesIO()
            format_map = {'JPEG': 'JPEG', 'PNG': 'PNG', 'JPG': 'JPEG'}
            save_format = format_map.get(image.format, 'JPEG')
            
            if save_format == 'JPEG':
                resized_image.save(output, format=save_format, quality=85, optimize=True)
            else:
                resized_image.save(output, format=save_format, optimize=True)
            
            return output.getvalue()
            
        except Exception as e:
            print(f"Error resizing image: {e}")
            return image_bytes


# Singleton instance
parser = None

def get_parser() -> DataParser:
    global parser
    if parser is None:
        parser = DataParser()
    return parser