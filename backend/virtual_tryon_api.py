from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
import requests
from services.virtual_tryon import VirtualTryOnService
import logging

# Create Flask app
app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize service
tryon_service = VirtualTryOnService()

@app.route('/api/virtual-tryon', methods=['POST'])
def process_virtual_tryon():
    """
    Advanced Virtual Try-On API endpoint
    """
    try:
        data = request.get_json()
        
        if not data or 'person_image' not in data or 'garment_image' not in data:
            return jsonify({'error': 'Missing required images'}), 400
        
        person_image_data = data['person_image']
        garment_image_data = data['garment_image']
        product_info = data.get('product_info', {})
        
        logger.info(f"Processing virtual try-on for product: {product_info.get('name', 'Unknown')}")
        
        # Convert base64 to bytes
        person_bytes = base64_to_bytes(person_image_data)
        
        # Handle garment image (could be URL or base64)
        if garment_image_data.startswith('http'):
            garment_bytes = download_image_bytes(garment_image_data)
        else:
            garment_bytes = base64_to_bytes(garment_image_data)
        
        # Process with enhanced AI
        result_image = enhanced_virtual_tryon(person_bytes, garment_bytes, product_info)
        
        # Convert result to bytes
        img_io = io.BytesIO()
        result_image.save(img_io, 'JPEG', quality=90)
        img_io.seek(0)
        
        return send_file(
            img_io,
            mimetype='image/jpeg',
            as_attachment=False
        )
        
    except Exception as e:
        logger.error(f"Virtual try-on error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

def enhanced_virtual_tryon(person_bytes, garment_bytes, product_info):
    """
    Python-based virtual try-on with body detection
    """
    try:
        # Load images
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        garment_img = Image.open(io.BytesIO(garment_bytes)).convert('RGB')
        
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        logger.info(f"Processing: Person {person_np.shape}, Garment {garment_np.shape}")
        
        # Detect body landmarks
        landmarks = detect_body_landmarks(person_np)
        
        # Calculate garment fit area
        product_type = product_info.get('subcategory', 'shirt')
        fit_area = calculate_garment_fit_area(landmarks, product_type, person_np.shape)
        
        # Apply garment to body
        result = apply_garment_to_body(person_np, garment_np, fit_area, product_info)
        
        # Add realistic effects
        result = add_realistic_lighting(result, fit_area, landmarks)
        result = add_processing_info(result, product_info, landmarks)
        
        return Image.fromarray(result)
        
    except Exception as e:
        logger.error(f"Virtual try-on failed: {e}")
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        return add_error_overlay(person_img, str(e))

def detect_body_landmarks(image):
    """
    Advanced body segmentation using multiple techniques
    """
    height, width = image.shape[:2]
    
    # Convert to different color spaces
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    
    # Multi-method skin detection
    skin_mask1 = detect_skin_rgb(image)
    skin_mask2 = detect_skin_hsv(hsv)
    skin_mask3 = detect_skin_lab(lab)
    
    # Combine masks
    combined_mask = cv2.bitwise_or(skin_mask1, skin_mask2)
    combined_mask = cv2.bitwise_or(combined_mask, skin_mask3)
    
    # Morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
    
    # Find and process contours
    contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Get largest contour (main body)
        largest_contour = max(contours, key=cv2.contourArea)
        body_mask = np.zeros((height, width), dtype=np.uint8)
        cv2.fillPoly(body_mask, [largest_contour], 255)
        
        # Expand for clothing area
        return expand_body_region(body_mask)
    
    # Fallback mask
    return create_default_body_mask(width, height)

def detect_skin_rgb(image):
    """Enhanced skin detection in RGB"""
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    
    # Multiple skin tone ranges
    ranges = [
        ([95, 40, 20], [255, 200, 150]),   # Light
        ([80, 35, 15], [220, 180, 120]),   # Medium
        ([45, 25, 10], [180, 150, 100]),   # Dark
        ([60, 30, 15], [200, 170, 130])    # Additional range
    ]
    
    for lower, upper in ranges:
        temp_mask = cv2.inRange(image, np.array(lower), np.array(upper))
        mask = cv2.bitwise_or(mask, temp_mask)
    
    return mask

def detect_skin_hsv(hsv_image):
    """Skin detection in HSV color space"""
    lower1 = np.array([0, 20, 70])
    upper1 = np.array([20, 255, 255])
    mask1 = cv2.inRange(hsv_image, lower1, upper1)
    
    lower2 = np.array([0, 10, 60])
    upper2 = np.array([25, 150, 255])
    mask2 = cv2.inRange(hsv_image, lower2, upper2)
    
    return cv2.bitwise_or(mask1, mask2)

def detect_skin_lab(lab_image):
    """Skin detection in LAB color space"""
    lower = np.array([20, 15, 10])
    upper = np.array([200, 165, 150])
    return cv2.inRange(lab_image, lower, upper)

def expand_body_region(mask):
    """Expand body mask to include clothing areas"""
    coords = np.column_stack(np.where(mask > 0))
    if len(coords) == 0:
        return mask
    
    min_y, min_x = coords.min(axis=0)
    max_y, max_x = coords.max(axis=0)
    
    # Calculate expansion
    body_width = max_x - min_x
    body_height = max_y - min_y
    
    expand_x = int(body_width * 0.25)
    expand_y = int(body_height * 0.15)
    
    # Create expanded mask
    expanded = mask.copy()
    
    # Add torso region
    torso_top = max(0, min_y + int(body_height * 0.15))
    torso_bottom = min(mask.shape[0], max_y + expand_y)
    torso_left = max(0, min_x - expand_x)
    torso_right = min(mask.shape[1], max_x + expand_x)
    
    cv2.rectangle(expanded, (torso_left, torso_top), (torso_right, torso_bottom), 200, -1)
    
    return expanded

def create_default_body_mask(width, height):
    """Create default body mask when detection fails"""
    mask = np.zeros((height, width), dtype=np.uint8)
    
    center_x = width // 2
    
    # Head region
    head_y = int(height * 0.15)
    head_radius = int(width * 0.08)
    cv2.circle(mask, (center_x, head_y), head_radius, 255, -1)
    
    # Torso region
    torso_top = int(height * 0.25)
    torso_bottom = int(height * 0.75)
    torso_width = int(width * 0.35)
    
    cv2.rectangle(mask, 
                  (center_x - torso_width//2, torso_top),
                  (center_x + torso_width//2, torso_bottom),
                  200, -1)
    
    return mask

def fit_garment_realistic(garment, body_mask, target_shape, product_info):
    """Fit garment realistically to body"""
    height, width = target_shape[:2]
    
    # Find body bounds
    coords = np.column_stack(np.where(body_mask > 0))
    if len(coords) == 0:
        return np.zeros_like(garment)
    
    min_y, min_x = coords.min(axis=0)
    max_y, max_x = coords.max(axis=0)
    
    # Product-specific fitting
    product_name = product_info.get('name', '').lower()
    
    if 'dress' in product_name:
        # Dress fitting
        garment_top = min_y + int((max_y - min_y) * 0.1)
        garment_bottom = min(height, max_y + int((max_y - min_y) * 0.2))
        garment_left = max(0, min_x - int((max_x - min_x) * 0.1))
        garment_right = min(width, max_x + int((max_x - min_x) * 0.1))
    elif 'jacket' in product_name or 'blazer' in product_name:
        # Jacket fitting
        garment_top = max(0, min_y - int((max_y - min_y) * 0.05))
        garment_bottom = min_y + int((max_y - min_y) * 0.65)
        garment_left = max(0, min_x - int((max_x - min_x) * 0.15))
        garment_right = min(width, max_x + int((max_x - min_x) * 0.15))
    else:
        # Default shirt/top fitting
        garment_top = min_y + int((max_y - min_y) * 0.05)
        garment_bottom = min_y + int((max_y - min_y) * 0.6)
        garment_left = max(0, min_x - int((max_x - min_x) * 0.05))
        garment_right = min(width, max_x + int((max_x - min_x) * 0.05))
    
    # Calculate dimensions
    fit_width = garment_right - garment_left
    fit_height = garment_bottom - garment_top
    
    # Resize garment
    garment_resized = cv2.resize(garment, (fit_width, fit_height))
    
    # Apply color tinting if specified
    if product_info.get('colorHex'):
        garment_resized = apply_color_tint(garment_resized, product_info['colorHex'])
    
    # Create fitted garment image
    fitted = np.zeros((height, width, 3), dtype=np.uint8)
    fitted[garment_top:garment_bottom, garment_left:garment_right] = garment_resized
    
    return fitted

def apply_color_tint(image, color_hex):
    """Apply color tint to garment"""
    # Convert hex to RGB
    color_hex = color_hex.lstrip('#')
    tint_color = tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))
    
    # Create tint overlay
    tint_overlay = np.full_like(image, tint_color, dtype=np.uint8)
    
    # Blend with multiply mode
    result = cv2.multiply(image.astype(np.float32), tint_overlay.astype(np.float32))
    result = np.clip(result / 255.0, 0, 1) * 255
    
    return result.astype(np.uint8)

def realistic_blend(person, garment, mask):
    """Realistic blending with advanced techniques"""
    result = person.copy()
    
    # Create smooth blending mask
    blend_mask = (mask > 0).astype(np.float32)
    
    # Apply Gaussian blur for smooth edges
    blend_mask = cv2.GaussianBlur(blend_mask, (21, 21), 0)
    
    # Normalize mask
    blend_mask = blend_mask / 255.0
    blend_mask = np.expand_dims(blend_mask, axis=2)
    
    # Advanced blending
    garment_contribution = 0.85
    person_contribution = 1.0 - (blend_mask * garment_contribution)
    
    # Blend images
    result = (person.astype(np.float32) * person_contribution + 
              garment.astype(np.float32) * blend_mask * garment_contribution)
    
    return np.clip(result, 0, 255).astype(np.uint8)

def apply_realistic_effects(image, mask):
    """Apply realistic lighting and shadow effects"""
    result = image.copy()
    height, width = image.shape[:2]
    
    # Create lighting gradient
    y_coords, x_coords = np.ogrid[:height, :width]
    y_norm = y_coords / height
    x_norm = x_coords / width
    
    # Lighting from top-left
    light_intensity = 1.0 - (y_norm * 0.2 + x_norm * 0.1)
    light_intensity = np.clip(light_intensity, 0.8, 1.0)
    
    # Apply lighting to masked areas
    mask_bool = mask > 100
    for c in range(3):
        channel = result[:, :, c].astype(np.float32)
        channel[mask_bool] *= light_intensity[mask_bool]
        result[:, :, c] = np.clip(channel, 0, 255).astype(np.uint8)
    
    # Add subtle shadow on right side
    shadow_gradient = np.zeros((height, width))
    shadow_gradient[:, width//2:] = np.linspace(0, 0.1, width//2)
    
    for c in range(3):
        channel = result[:, :, c].astype(np.float32)
        channel[mask_bool] *= (1.0 - shadow_gradient[mask_bool])
        result[:, :, c] = np.clip(channel, 0, 255).astype(np.uint8)
    
    return result

def enhance_final_result(image, product_info):
    """Final enhancement and post-processing"""
    # Convert to PIL for advanced processing
    pil_image = Image.fromarray(image)
    
    # Sharpening
    pil_image = pil_image.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=3))
    
    # Contrast enhancement
    enhancer = ImageEnhance.Contrast(pil_image)
    pil_image = enhancer.enhance(1.08)
    
    # Color enhancement
    enhancer = ImageEnhance.Color(pil_image)
    pil_image = enhancer.enhance(1.12)
    
    # Product-specific adjustments
    product_name = product_info.get('name', '').lower()
    if 'formal' in product_name:
        # More contrast for formal wear
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.15)
    elif 'casual' in product_name:
        # Softer look for casual wear
        enhancer = ImageEnhance.Brightness(pil_image)
        pil_image = enhancer.enhance(1.02)
    
    return np.array(pil_image)

def base64_to_bytes(base64_string):
    """Convert base64 string to bytes"""
    if base64_string.startswith('data:'):
        base64_string = base64_string.split(',')[1]
    return base64.b64decode(base64_string)

def download_image_bytes(url):
    """Download image from URL"""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.content

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)