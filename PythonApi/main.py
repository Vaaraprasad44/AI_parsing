from fastapi import FastAPI, HTTPException, UploadFile, File
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
        personal_info = await parser.parse_personal_info_from_text(request.input_text)
        
        # Calculate confidence based on how many fields were populated
        filled_fields = sum(1 for field_name, field_value in personal_info.model_dump().items() 
                           if field_value is not None and field_value != "")
        total_fields = len(personal_info.model_fields)
        confidence = min(0.95, max(0.1, filled_fields / total_fields))  # Scale between 0.1 and 0.95
        
        return PersonalInfoResponse(
            input_text=request.input_text,
            personal_info=personal_info,
            confidence=confidence,
            source_type="text"
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personal information parsing failed: {str(e)}")


# ID card image parsing endpoint
@app.post("/api/personal-info/parse-image", response_model=PersonalInfoResponse)
async def parse_personal_info_from_image(file: UploadFile = File(...)):
    print(f"=== Image upload endpoint called ===")
    """
    Extract personal information from ID card or identification document image.
    
    Supports common image formats: JPEG, PNG, JPG.
    Maximum file size: 4MB for optimal processing.
    
    Returns structured personal information including:
    - Name, Address components
    - Date of birth, ID number, Expiration date
    - Phone number, Email (if visible)
    """
    try:
        print(f"Received file upload - filename: {file.filename}, content_type: {file.content_type}, size: {file.size if hasattr(file, 'size') else 'unknown'}")
        
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
            print(f"Invalid content type: {file.content_type}")
            raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Check file size (max 20MB as per Groq limits)
        if len(image_bytes) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB")
        
        parser = get_parser()
        personal_info = await parser.parse_personal_info_from_image(image_bytes)
        
        # Calculate confidence based on how many fields were populated
        filled_fields = sum(1 for field_name, field_value in personal_info.model_dump().items() 
                           if field_value is not None and field_value != "")
        total_fields = len(personal_info.model_fields)
        confidence = min(0.95, max(0.1, filled_fields / total_fields))
        
        return PersonalInfoResponse(
            input_text=f"Processed image: {file.filename}",
            personal_info=personal_info,
            confidence=confidence,
            source_type="image"
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Image processing error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")