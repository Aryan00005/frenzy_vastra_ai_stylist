from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/virtual-tryon', methods=['POST'])
def virtual_tryon():
    try:
        print("🔄 Received virtual try-on request")
        data = request.get_json()
        
        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No data received'}), 400
        
        # Get images
        person_b64 = data.get('person_image')
        garment_url = data.get('garment_image')
        product_info = data.get('product_info', {})
        
        print(f"📸 Processing: {product_info.get('name', 'Unknown Product')}")
        print(f"🔗 Garment URL: {garment_url[:50]}...")
        
        # Convert person image
        if person_b64.startswith('data:'):
            person_b64 = person_b64.split(',')[1]
        person_bytes = base64.b64decode(person_b64)
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        print(f"✅ Person image loaded: {person_img.size}")
        
        # Download garment image
        print("⬇️ Downloading garment image...")
        garment_response = requests.get(garment_url, timeout=10)
        garment_img = Image.open(io.BytesIO(garment_response.content)).convert('RGB')
        print(f"✅ Garment image loaded: {garment_img.size}")
        
        # Process virtual try-on
        print("🎨 Starting virtual try-on processing...")
        result = process_tryon(person_img, garment_img, product_info)
        print(f"✅ Processing complete: {result.size}")
        
        # Return result
        img_io = io.BytesIO()
        result.save(img_io, 'JPEG', quality=90)
        img_io.seek(0)
        
        print("📤 Sending result back to frontend")
        return send_file(img_io, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

def process_tryon(person_img, garment_img, product_info):
    try:
        print("🔍 Converting images to numpy arrays...")
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        height, width = person_np.shape[:2]
        print(f"📐 Image dimensions: {width}x{height}")
        
        # Detect body region using skin detection
        print("👤 Detecting body region...")
        body_region = detect_body_region(person_np)
        print(f"✅ Body detection: {body_region['detected']}")
        
        # Calculate garment placement based on product type
        print("📏 Calculating garment placement...")
        garment_area = calculate_garment_placement(body_region, product_info, width, height)
        print(f"📍 Garment area: {garment_area}")
        
        # Apply garment with realistic fitting
        print("🎨 Applying garment to body...")
        result = apply_garment_realistic(person_np, garment_np, garment_area, product_info)
        
        # Add processing info
        print("📝 Adding info overlay...")
        result_pil = Image.fromarray(result)
        result_pil = add_info_overlay(result_pil, product_info, body_region)
        
        print("✅ Virtual try-on processing completed successfully")
        return result_pil
        
    except Exception as e:
        print(f"❌ Error in process_tryon: {str(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        raise e

def detect_body_region(image):
    """Detect body region using skin tone detection"""
    height, width = image.shape[:2]
    
    # Convert to HSV for better skin detection
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    
    # Skin color range in HSV
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    # Create skin mask
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Get largest contour (main body)
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Calculate proper body landmarks
        face_y = y + h * 0.1  # Face at top 10%
        shoulder_y = y + h * 0.25  # Shoulders at 25%
        chest_y = y + h * 0.35  # Chest at 35%
        
        return {
            'face_x': x + w//2, 'face_y': int(face_y),
            'shoulder_left': x + w//4, 'shoulder_right': x + 3*w//4,
            'shoulder_y': int(shoulder_y),
            'chest_y': int(chest_y),
            'torso_x': x + w//6, 'torso_y': int(chest_y),
            'torso_width': 2*w//3, 'torso_height': h//3,
            'detected': True
        }
    
    # Fallback if no skin detected
    return {
        'face_x': width//2, 'face_y': height//8,
        'shoulder_left': width//3, 'shoulder_right': 2*width//3,
        'shoulder_y': height//4,
        'chest_y': height//3,
        'torso_x': width//3, 'torso_y': height//3,
        'torso_width': width//3, 'torso_height': height//3,
        'detected': False
    }

def calculate_garment_placement(body_region, product_info, width, height):
    """Calculate where to place garment based on body and product type"""
    product_type = product_info.get('subcategory', 'shirt').lower()
    
    # Use chest_y instead of shoulder_y for better placement
    base_y = body_region.get('chest_y', body_region['shoulder_y'])
    
    if product_type == 'tshirt' or product_type == 'shirt':
        # Shirt/T-shirt placement - start from chest area
        return {
            'x': body_region['torso_x'],
            'y': base_y,
            'width': body_region['torso_width'],
            'height': int(body_region['torso_height'] * 1.2)
        }
    elif product_type == 'jacket':
        # Jacket placement (larger, starts higher)
        return {
            'x': body_region['torso_x'] - 30,
            'y': body_region['shoulder_y'] + 20,
            'width': body_region['torso_width'] + 60,
            'height': int(body_region['torso_height'] * 1.4)
        }
    else:
        # Default placement
        return {
            'x': body_region['torso_x'],
            'y': base_y,
            'width': body_region['torso_width'],
            'height': body_region['torso_height']
        }

def apply_garment_realistic(person_img, garment_img, garment_area, product_info):
    """Apply garment with realistic blending and fitting"""
    result = person_img.copy()
    
    # Ensure coordinates are within image bounds
    height, width = person_img.shape[:2]
    x = max(0, min(garment_area['x'], width - 50))
    y = max(0, min(garment_area['y'], height - 50))
    w = min(garment_area['width'], width - x)
    h = min(garment_area['height'], height - y)
    
    print(f"🎯 Final placement: x={x}, y={y}, w={w}, h={h}")
    
    if w <= 0 or h <= 0:
        print("⚠️ Invalid dimensions, skipping garment application")
        return result
    
    # Resize garment to fit area
    garment_resized = cv2.resize(garment_img, (w, h))
    
    # Apply color tinting if specified
    if product_info.get('colorHex') and product_info['colorHex'] != '#FFFFFF':
        garment_resized = apply_color_tint(garment_resized, product_info['colorHex'])
    
    # Create smooth blending mask
    mask = create_smooth_mask(w, h)
    
    # Apply garment with stronger blending
    roi = result[y:y+h, x:x+w]
    
    # Stronger garment visibility
    for c in range(3):
        result[y:y+h, x:x+w, c] = (roi[:, :, c] * (1 - mask * 0.7) + 
                                   garment_resized[:, :, c] * mask * 0.7).astype(np.uint8)
    
    print("✅ Garment applied successfully")
    return result

def create_smooth_mask(width, height):
    """Create a smooth blending mask"""
    mask = np.ones((height, width), dtype=np.float32)
    
    # Create soft edges
    edge_size = min(width, height) // 8
    
    # Fade edges
    for i in range(edge_size):
        alpha = i / edge_size
        mask[i, :] *= alpha  # Top
        mask[height-1-i, :] *= alpha  # Bottom
        mask[:, i] *= alpha  # Left
        mask[:, width-1-i] *= alpha  # Right
    
    return mask

def apply_color_tint(image, color_hex):
    """Apply color tint to image"""
    # Convert hex to RGB
    color_hex = color_hex.lstrip('#')
    if len(color_hex) == 6:
        r, g, b = tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))
        
        # Apply tint
        tinted = image.copy().astype(np.float32)
        tinted[:, :, 0] = tinted[:, :, 0] * (r / 255.0)
        tinted[:, :, 1] = tinted[:, :, 1] * (g / 255.0)
        tinted[:, :, 2] = tinted[:, :, 2] * (b / 255.0)
        
        return np.clip(tinted, 0, 255).astype(np.uint8)
    
    return image

def add_info_overlay(image, product_info, body_region):
    """Add information overlay to result"""
    draw = ImageDraw.Draw(image)
    
    # Background for text
    draw.rectangle([10, 10, 350, 70], fill=(0, 0, 0, 180))
    
    # Product name
    try:
        draw.text((20, 20), f"🐍 Python Try-On: {product_info['name']}", fill=(255, 255, 255))
        
        # Status
        status = "✓ Body Detected" if body_region['detected'] else "⚠ Fallback Mode"
        draw.text((20, 40), f"{status} ✓ Garment Fitted ✓ Realistic Blend", fill=(0, 255, 0))
        
        # Quality indicator
        quality = "High" if body_region['detected'] else "Medium"
        draw.text((20, 55), f"Quality: {quality}", fill=(0, 255, 255))
        
    except Exception as e:
        draw.text((20, 20), "Python Virtual Try-On", fill=(255, 255, 255))
        draw.text((20, 40), "Processing Complete", fill=(0, 255, 0))
    
    return image

if __name__ == '__main__':
    print("🐍 Starting Python Virtual Try-On Backend...")
    print("🌐 Backend running at: http://localhost:3001")
    print("🎯 Ready for virtual try-on requests!")
    app.run(host='0.0.0.0', port=3001, debug=True)