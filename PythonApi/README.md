# Personal Information Parser API - Python FastAPI Implementation

A FastAPI implementation for parsing personal information from text using AI-powered extraction.

## Features

- AI-powered personal information extraction from natural language text
- Groq API integration for fast inference
- CORS enabled for cross-origin requests
- Auto-generated API documentation at `/swagger`
- Structured response format for parsed personal data

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file with your Groq API key:

```bash
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

## Running the Application

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- Swagger documentation: `http://localhost:8000/swagger`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

- `POST /api/personal-info/parse` - Extract personal information from text

### Example Request

```json
{
  "input_text": "My name is Sergio Ramos, I live in 2874 crest dr, Detroit, Michigan, USA, 48823. My phone number is 603-327-4883."
}
```

### Example Response

```json
{
  "input_text": "My name is Sergio Ramos...",
  "personal_info": {
    "name": "Sergio Ramos",
    "street": "2874 crest dr",
    "city": "Detroit",
    "state": "Michigan",
    "country": "USA",
    "zip_code": "48823",
    "phone_number": "603-327-4883",
    "email": null
  },
  "confidence": 0.95
}
```

## Project Structure

```
PythonApi/
├── main.py              # FastAPI application and endpoints
├── models.py            # Pydantic models for request/response
├── openai_service.py    # AI service for personal info parsing
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment file
└── README.md           # This file
```

## Supported Personal Information Fields

- **name**: Full name of the person
- **street**: Street address (number and street name)
- **city**: City name
- **state**: State or province
- **country**: Country name
- **zip_code**: Postal/ZIP code
- **phone_number**: Phone number
- **email**: Email address (if present)