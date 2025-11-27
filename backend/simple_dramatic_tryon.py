from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import io
import base64
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/virtual-tryon', methods=['POST'])
def virtual_tryon():
    try:
        print("=== DRAMATIC VIRTUAL TRY-ON ===")
        data = request.get_json()
        
        person_b64 = data['person_image']
        garment_url = data['garment_image']
        product_info = data['product_info']
        
        print(f"Processing: {product_info.get('name', 'Unknown Product')}")
        
        # Convert person image
        if person_b64.startswith('data:'):
            person_b64 = person_b64.split(',')[1]
        person_bytes = base64.b64decode(person_b64)
        
        # Download garment
        print("Downloading garment...")
        garment_response = requests.get(garment_url, timeout=10)
        garment_bytes = garment_response.content
        
        # Create DRAMATIC result
        result = create_super_dramatic_tryon(person_bytes, garment_bytes, product_info)
        
        # Save result
        img_io = io.BytesIO()
        result.save(img_io, 'JPEG', quality=95)
        img_io.seek(0)
        
        print("=== DRAMATIC TRY-ON COMPLETE ===")
        return send_file(img_io, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500

def create_super_dramatic_tryon(person_bytes, garment_bytes, product_info):
    """Create virtual try-on with comprehensive error handling"""
    
    try:
        # Load images
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        garment_img = Image.open(io.BytesIO(garment_bytes)).convert('RGB')
        
        # Convert to numpy
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        print(f"Person: {person_np.shape}, Garment: {garment_np.shape}")
        
        # Find the shirt area using color detection
        shirt_region = detect_shirt_dramatically(person_np)
        
        if shirt_region:
            x, y, w, h = shirt_region
            print(f"Shirt detected at: {x}, {y}, {w}, {h}")
            
            # Validate coordinates
            if w > 0 and h > 0 and x >= 0 and y >= 0:
                result = apply_dramatic_replacement(person_np, garment_np, x, y, w, h, product_info)
            else:
                print("Invalid coordinates, using fallback")
                result = create_fallback_result(person_np, garment_np, product_info)
        else:
            print("No shirt detected - using center placement")
            result = create_fallback_result(person_np, garment_np, product_info)
        
        return Image.fromarray(result)
        
    except Exception as e:
        print(f"Error in tryon processing: {e}")
        # Return original image with error message
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        return add_error_message(person_img, str(e))

def create_fallback_result(person_np, garment_np, product_info):
    """Create fallback result when detection fails"""
    
    h, w = person_np.shape[:2]
    x, y, w_shirt, h_shirt = w//4, h//3, w//2, h//2
    
    # Ensure coordinates are valid
    x = max(0, min(x, w-1))
    y = max(0, min(y, h-1))
    w_shirt = max(1, min(w_shirt, w-x))
    h_shirt = max(1, min(h_shirt, h-y))
    
    return apply_dramatic_replacement(person_np, garment_np, x, y, w_shirt, h_shirt, product_info)

def add_error_message(image, error_msg):
    """Add error message to image"""
    
    draw = ImageDraw.Draw(image)
    draw.text((50, 50), f"Error: {error_msg}", fill=(255, 0, 0))
    return image

def detect_shirt_dramatically(person_img):
    """Detect shirt area with maximum accuracy"""
    
    # Convert to HSV for better color detection
    hsv = cv2.cvtColor(person_img, cv2.COLOR_RGB2HSV)
    
    # Detect light blue shirt (expanded range)
    lower_blue = np.array([80, 20, 80])
    upper_blue = np.array([140, 255, 255])
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Clean up the mask
    kernel = np.ones((5,5), np.uint8)
    blue_mask = cv2.morphologyEx(blue_mask, cv2.MORPH_CLOSE, kernel)
    blue_mask = cv2.morphologyEx(blue_mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(blue_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        if area > 5000:  # Minimum area threshold
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Expand the region significantly
            padding = 40
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(person_img.shape[1] - x, w + 2*padding)
            h = min(person_img.shape[0] - y, h + 2*padding)
            
            return (x, y, w, h)
    
    return None

def apply_dramatic_replacement(person_img, garment_img, x, y, w, h, product_info):
    """Apply replacement with aggressive white background removal"""
    
    try:
        result = person_img.copy()
        
        # Validate dimensions
        if w <= 0 or h <= 0:
            print(f"Invalid dimensions: w={w}, h={h}")
            return result
        
        # Resize garment to fit
        garment_resized = cv2.resize(garment_img, (w, h), interpolation=cv2.INTER_LANCZOS4)
        
        # REMOVE WHITE BACKGROUND from garment
        garment_clean, garment_mask = remove_white_background(garment_resized)
        
        # Enhance the clean garment
        garment_enhanced = enhance_garment_dramatically(garment_clean)
        
        # Validate ROI bounds
        y_end = min(y + h, result.shape[0])
        x_end = min(x + w, result.shape[1])
        
        if y >= result.shape[0] or x >= result.shape[1] or y_end <= y or x_end <= x:
            print(f"Invalid ROI bounds: x={x}, y={y}, w={w}, h={h}")
            return result
        
        # Get actual dimensions after bounds checking
        actual_h = y_end - y
        actual_w = x_end - x
        
        # Resize mask and garment to actual dimensions if needed
        if actual_h != h or actual_w != w:
            garment_enhanced = cv2.resize(garment_enhanced, (actual_w, actual_h))
            garment_mask = cv2.resize(garment_mask, (actual_w, actual_h))
        
        # Apply replacement only where garment exists (no white background)
        roi = result[y:y_end, x:x_end]
        
        # Apply with strong replacement (95%)
        for c in range(3):
            result[y:y_end, x:x_end, c] = (
                roi[:, :, c] * (1 - garment_mask * 0.95) + 
                garment_enhanced[:, :, c] * garment_mask * 0.95
            ).astype(np.uint8)
        
        # Add clean indicators
        add_clean_indicators(result, x, y, actual_w, actual_h, product_info)
        
        print(f"Replacement applied successfully at {x},{y} with size {actual_w}x{actual_h}")
        
        return result
        
    except Exception as e:
        print(f"Error in apply_dramatic_replacement: {e}")
        return person_img

def enhance_garment_dramatically(garment):
    """Make garment as visible as possible"""
    
    # Convert to PIL for enhancement
    garment_pil = Image.fromarray(garment)
    
    # Dramatic contrast increase
    from PIL import ImageEnhance
    contrast = ImageEnhance.Contrast(garment_pil)
    garment_pil = contrast.enhance(2.0)
    
    # Dramatic brightness increase
    brightness = ImageEnhance.Brightness(garment_pil)
    garment_pil = brightness.enhance(1.3)
    
    # Dramatic color saturation
    color = ImageEnhance.Color(garment_pil)
    garment_pil = color.enhance(1.5)
    
    return np.array(garment_pil)

def create_minimal_blend_mask(w, h):
    """Create mask with minimal blending for maximum visibility"""
    
    mask = np.ones((h, w), dtype=np.float32)
    
    # Very small edge fade
    fade = 8
    
    # Top edge
    for i in range(min(fade, h)):
        mask[i, :] *= (i / fade)
    
    # Bottom edge
    for i in range(min(fade, h)):
        mask[h-1-i, :] *= (i / fade)
    
    # Left edge
    for i in range(min(fade, w)):
        mask[:, i] *= (i / fade)
    
    # Right edge
    for i in range(min(fade, w)):
        mask[:, w-1-i] *= (i / fade)
    
    return mask

def remove_white_background(garment_img):
    """Aggressively remove white background from garment"""
    
    print(f"Removing white background from garment shape: {garment_img.shape}")
    
    # Method 1: RGB-based white detection (more aggressive)
    # Detect pixels that are very close to white
    white_threshold = 240  # Pixels above this in all channels are considered white
    
    # Create mask for white pixels
    white_mask = np.all(garment_img >= white_threshold, axis=2)
    
    # Also detect light gray/off-white pixels
    light_gray_threshold = 220
    light_mask = np.all(garment_img >= light_gray_threshold, axis=2)
    
    # Combine masks
    background_mask = np.logical_or(white_mask, light_mask)
    
    # Invert to get shirt areas
    shirt_mask = np.logical_not(background_mask)
    
    # Convert to float
    shirt_mask_float = shirt_mask.astype(np.float32)
    
    # Clean up the mask
    kernel = np.ones((5,5), np.uint8)
    shirt_mask_clean = cv2.morphologyEx((shirt_mask_float * 255).astype(np.uint8), cv2.MORPH_CLOSE, kernel)
    shirt_mask_clean = cv2.morphologyEx(shirt_mask_clean, cv2.MORPH_OPEN, kernel)
    
    # Convert back to float
    shirt_mask_float = shirt_mask_clean.astype(np.float32) / 255.0
    
    # Apply strong gaussian blur for smooth edges
    shirt_mask_float = cv2.GaussianBlur(shirt_mask_float, (7, 7), 3)
    
    print(f"Shirt mask created - non-zero pixels: {np.count_nonzero(shirt_mask_float)}")
    
    return garment_img, shirt_mask_float

def add_clean_indicators(result, x, y, w, h, product_info):
    """Add clean, professional indicators"""
    
    # Subtle border
    cv2.rectangle(result, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    # Clean text overlay
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # Main title (smaller and cleaner)
    text = "Virtual Try-On"
    text_size = cv2.getTextSize(text, font, 1, 2)[0]
    text_x = (result.shape[1] - text_size[0]) // 2
    text_y = 40
    
    # Text background
    cv2.rectangle(result, (text_x-5, text_y-25), (text_x+text_size[0]+5, text_y+5), (0, 0, 0), -1)
    # Text
    cv2.putText(result, text, (text_x, text_y), font, 1, (0, 255, 0), 2)
    
    # Product name (smaller)
    product_text = f"{product_info.get('name', 'New Shirt')}"
    cv2.putText(result, product_text, (20, result.shape[0]-20), font, 0.7, (255, 255, 255), 2)

if __name__ == '__main__':
    print("Starting Clean Virtual Try-On (No White Background)...")
    print("Backend running at: http://localhost:3001")
    app.run(host='0.0.0.0', port=3001, debug=True)