import cv2
import numpy as np
from PIL import Image
import io

async def simple_fallback(person_bytes, garment_bytes):
    """Simple fallback when everything fails"""
    person_img = Image.open(io.BytesIO(person_bytes))
    garment_img = Image.open(io.BytesIO(garment_bytes))
    
    person_np = np.array(person_img)
    garment_np = np.array(garment_img)
    
    h, w = person_np.shape[:2]
    garment_resized = cv2.resize(garment_np, (w//3, h//2))
    
    result = person_np.copy()
    y_offset = h//4
    x_offset = w//3
    
    # Simple overlay
    gh, gw = garment_resized.shape[:2]
    if y_offset + gh <= h and x_offset + gw <= w:
        result[y_offset:y_offset+gh, x_offset:x_offset+gw] = garment_resized
    
    return Image.fromarray(result)