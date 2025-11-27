from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
from PIL import Image
import io
import base64
from services.virtual_tryon import VirtualTryOnService
from services.advanced_tryon import AdvancedTryOnService
from services.pose_tryon import PoseTryOnService
from services.style_analyzer import StyleAnalyzer
from services.llm_stylist import LLMStylist
from services.recommendation_engine import RecommendationEngine

app = FastAPI(title="Frenzy Vastra AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4028"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
virtual_tryon = VirtualTryOnService()
advanced_tryon = AdvancedTryOnService()
pose_tryon = PoseTryOnService()
style_analyzer = StyleAnalyzer()
llm_stylist = LLMStylist()
recommendation_engine = RecommendationEngine()

@app.post("/api/virtual-tryon")
async def virtual_tryon_endpoint(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    product_info: dict = None
):
    try:
        # Read images
        person_bytes = await person_image.read()
        garment_bytes = await garment_image.read()
        
        # Use pose-based AI try-on
        result_image = await pose_tryon.realistic_tryon(
            person_bytes, garment_bytes, product_info
        )
        
        # Convert to bytes for response
        img_byte_arr = io.BytesIO()
        result_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/jpeg"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-style")
async def analyze_style(image: UploadFile = File(...), user_preferences: dict = None):
    try:
        image_bytes = await image.read()
        
        # Use LLM for advanced analysis
        llm_analysis = await llm_stylist.analyze_style_with_llm(image_bytes, user_preferences)
        
        # Combine with traditional analysis
        basic_analysis = await style_analyzer.analyze_image(image_bytes)
        
        return {
            'llm_analysis': llm_analysis,
            'basic_analysis': basic_analysis,
            'combined_recommendations': llm_analysis['recommendations']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations")
async def get_recommendations(user_data: dict):
    try:
        # Get ML recommendations
        ml_recommendations = await recommendation_engine.generate_recommendations(user_data)
        
        # Get LLM styling advice
        styling_advice = await llm_stylist.get_personalized_styling_advice(user_data)
        
        return {
            'ml_recommendations': ml_recommendations,
            'styling_advice': styling_advice,
            'personalized_tips': styling_advice['key_points']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/outfit-suggestions")
async def get_outfit_suggestions(style_data: dict):
    try:
        outfits = await llm_stylist._suggest_complete_outfits(style_data)
        return {'outfit_suggestions': outfits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Frenzy Vastra AI Backend with LLM Integration"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)