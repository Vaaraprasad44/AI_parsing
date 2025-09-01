from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from models import PersonalInfoRequest, PersonalInfoResponse, PersonalInfo
from openai_service import get_parser

app = FastAPI(title="Personal Information Parser API", version="v1", docs_url="/swagger", redoc_url="/redoc")
app.title = "Personal Information Parser API"
app.version = "v1"
app.description = "AI-powered personal information extraction from text"

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Send interactive user to swagger page by default
@app.get("/")
async def redirect_to_swagger():
    return RedirectResponse(url="/swagger")

# Personal information parsing endpoint
@app.post("/api/personal-info/parse", response_model=PersonalInfoResponse)
async def parse_personal_info(request: PersonalInfoRequest):
    """
    Extract personal information from input text using AI.
    
    Example input: "My name is Sergio Ramos, I live in 2874 crest dr, Detroit, Michigan, USA, 48823. My phone number is 603-327-4883."
    
    Returns structured personal information including:
    - Name
    - Street address
    - City, State, Country
    - ZIP code
    - Phone number
    - Email (if present)
    """
    try:
        parser = get_parser()
        parsed_result = await parser.parse_personal_info(request.input_text)
        
        # Extract confidence from parsed result
        confidence = parsed_result.pop("confidence", 0.8)
        
        # Create PersonalInfo object
        personal_info = PersonalInfo(
            name=parsed_result.get("name"),
            street=parsed_result.get("street"),
            city=parsed_result.get("city"),
            state=parsed_result.get("state"),
            country=parsed_result.get("country"),
            zip_code=parsed_result.get("zip_code"),
            phone_number=parsed_result.get("phone_number"),
            email=parsed_result.get("email")
        )
        
        return PersonalInfoResponse(
            input_text=request.input_text,
            personal_info=personal_info,
            confidence=confidence
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personal information parsing failed: {str(e)}")