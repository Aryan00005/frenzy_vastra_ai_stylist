# 🐍 Python Backend Virtual Try-On Setup

## Quick Start

### 1. Start Python Backend
```bash
# Run the startup script
start_python_backend.bat

# Or manually:
cd backend
pip install flask flask-cors opencv-python pillow numpy requests
python virtual_tryon_api.py
```

### 2. Start React Frontend
```bash
npm start
```

### 3. Test Virtual Try-On
1. Go to: http://localhost:3000/virtual-tryon
2. Upload a photo
3. Select a product
4. Click "Try It On" - now uses Python backend!

## Python Backend Features

### 🔍 **Body Detection**
- Multi-color space skin detection (RGB, HSV, LAB)
- Body landmark identification (head, shoulders, torso, waist)
- Fallback detection for difficult images

### 👕 **Garment Fitting**
- Product-specific fitting areas (dress, jacket, shirt)
- Realistic garment resizing and placement
- Color tinting support

### 🎨 **Realistic Effects**
- Lighting and shadow simulation
- Smooth blending masks
- Quality enhancement (sharpening, contrast)

### 📊 **Processing Info**
- Real-time processing status
- Fit quality assessment
- Error handling with overlays

## API Endpoint

**POST** `http://localhost:3001/api/virtual-tryon`

**Request Body:**
```json
{
  "person_image": "data:image/jpeg;base64,...",
  "garment_image": "https://example.com/garment.jpg",
  "product_info": {
    "name": "Classic White Shirt",
    "category": "clothing",
    "subcategory": "shirt",
    "colorHex": "#FFFFFF"
  }
}
```

**Response:** Image blob (JPEG)

## Dependencies

```bash
pip install flask flask-cors opencv-python pillow numpy requests
```

## Troubleshooting

### Backend Not Starting
- Check Python installation: `python --version`
- Install missing packages: `pip install -r requirements.txt`
- Check port 3001 availability

### Processing Errors
- Ensure images are valid JPEG/PNG
- Check image URLs are accessible
- Monitor console for error messages

### Poor Results
- Use clear photos with good lighting
- Ensure person is visible in center of image
- Try different product types

The Python backend now handles all virtual try-on processing with advanced computer vision!