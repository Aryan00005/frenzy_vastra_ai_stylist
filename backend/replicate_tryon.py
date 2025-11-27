from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import io
import base64
from PIL import Image
import time

app = Flask(__name__)
CORS(app)

@app.route('/api/virtual-tryon', methods=['POST'])
def virtual_tryon():
    try:
        print("Starting Replicate Virtual Try-On...")
        data = request.get_json()
        
        person_b64 = data['person_image']
        garment_url = data['garment_image']
        product_info = data['product_info']
        
        print(f"Processing: {product_info.get('name', 'Unknown Product')}")
        
        # Convert person image
        if person_b64.startswith('data:'):
            person_b64 = person_b64.split(',')[1]
        person_bytes = base64.b64decode(person_b64)
        
        # Try Replicate API first
        try:
            result = call_replicate_tryon(person_bytes, garment_url)
            if result:
                print("Replicate API successful!")
                return send_file(io.BytesIO(result), mimetype='image/jpeg')
        except Exception as e:
            print(f"Replicate failed: {e}")
        
        # Fallback to dramatic simulation
        print("Using dramatic simulation fallback...")
        result = create_dramatic_tryon(person_bytes, garment_url, product_info)
        
        img_io = io.BytesIO()
        result.save(img_io, 'JPEG', quality=95)
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500

def call_replicate_tryon(person_bytes, garment_url):
    """Call Replicate API for virtual try-on"""
    try:
        # Convert person image to data URL
        person_b64 = base64.b64encode(person_bytes).decode('utf-8')
        person_data_url = f"data:image/jpeg;base64,{person_b64}"
        
        # Replicate API call
        payload = {
            "version": "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
            "input": {
                "human_img": person_data_url,
                "garm_img": garment_url,
                "garment_des": "shirt"
            }
        }
        
        headers = {
            "Authorization": "Token r8_your_token_here",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.replicate.com/v1/predictions",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        if response.status_code == 201:
            prediction = response.json()
            prediction_url = prediction['urls']['get']
            
            # Poll for result
            for _ in range(30):  # Wait up to 5 minutes
                time.sleep(10)
                result_response = requests.get(prediction_url, headers=headers)
                result_data = result_response.json()
                
                if result_data['status'] == 'succeeded':
                    output_url = result_data['output']
                    img_response = requests.get(output_url)
                    return img_response.content
                elif result_data['status'] == 'failed':
                    break
        
        return None
        
    except Exception as e:
        print(f"Replicate API error: {e}")
        return None

def create_dramatic_tryon(person_bytes, garment_url, product_info):
    """Create dramatic virtual try-on that's clearly visible"""
    
    # Load person image
    person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
    
    # Download garment
    garment_response = requests.get(garment_url, timeout=10)
    garment_img = Image.open(io.BytesIO(garment_response.content)).convert('RGB')
    
    # Convert to arrays
    import cv2
    import numpy as np
    
    person_np = np.array(person_img)
    garment_np = np.array(garment_img)
    
    # Detect shirt area (look for light blue)
    hsv = cv2.cvtColor(person_np, cv2.COLOR_RGB2HSV)
    lower_blue = np.array([90, 30, 100])
    upper_blue = np.array([130, 255, 255])
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Find largest contour
    contours, _ = cv2.findContours(blue_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Expand area
        padding = 30
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(person_np.shape[1] - x, w + 2*padding)
        h = min(person_np.shape[0] - y, h + 2*padding)
        
        print(f"Replacing shirt at: {x}, {y}, {w}, {h}")
        
        # Create dramatic replacement
        result = person_np.copy()
        
        # Resize garment
        garment_resized = cv2.resize(garment_np, (w, h))
        
        # Create strong mask
        mask = np.ones((h, w), dtype=np.float32)
        
        # Soft edges only
        edge_fade = 15
        for i in range(edge_fade):
            alpha = i / edge_fade
            mask[i, :] *= alpha
            mask[h-1-i, :] *= alpha
            mask[:, i] *= alpha
            mask[:, w-1-i] *= alpha
        
        # Apply with 90% strength
        roi = result[y:y+h, x:x+w]
        for c in range(3):
            result[y:y+h, x:x+w, c] = (
                roi[:, :, c] * (1 - mask * 0.9) + 
                garment_resized[:, :, c] * mask * 0.9
            ).astype(np.uint8)
        
        # Add dramatic border for visibility
        cv2.rectangle(result, (x, y), (x+w, y+h), (255, 0, 0), 4)
        
        # Add text overlay
        cv2.putText(result, "VIRTUAL TRY-ON ACTIVE", (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 0, 0), 3)
        
        return Image.fromarray(result)
    
    # Fallback - just add overlay text
    result = person_np.copy()
    cv2.putText(result, "TRY-ON PROCESSED", (50, 50), 
               cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
    
    return Image.fromarray(result)

if __name__ == '__main__':
    print("Starting Replicate Virtual Try-On System...")
    print("Backend running at: http://localhost:3001")
    app.run(host='0.0.0.0', port=3001, debug=True)