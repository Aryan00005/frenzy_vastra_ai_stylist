# 🧪 Virtual Try-On Test Guide

## Quick Test Steps

### 1. Start the Application
```bash
npm start
```

### 2. Navigate to Virtual Try-On
- Go to: http://localhost:3000/virtual-tryon
- Or click "Virtual Try-On" in the navigation

### 3. Test Upload Mode
1. Click "Upload Photo" tab
2. Upload any photo with a person
3. Select a product from the sidebar (e.g., "Classic White Shirt")
4. Click the big "✨ TRY IT ON WITH AI" button
5. Wait 2-3 seconds for processing
6. You should see the result with the garment overlaid

### 4. Expected Results
- ✅ Photo uploads successfully
- ✅ Product selection works
- ✅ "Try It On" button triggers processing
- ✅ Loading animation shows during processing
- ✅ Result image appears with garment overlay
- ✅ Label shows "✨ Virtual Try-On: [Product Name]"

### 5. Debug Console
Open browser console (F12) to see:
```
🚀 Starting Virtual Try-On for [Product Name]
📷 Processing images...
Person image: Loaded
Garment URL: [URL]
Product: [Product Name]
✅ Person image loaded
✅ Garment image loaded
✅ Both images loaded, processing...
✅ Virtual try-on complete!
```

## Troubleshooting

### Issue: No result appears
**Check:**
- Browser console for errors
- Network tab for failed image loads
- Make sure product has `overlay_image_url`

### Issue: "Try It On" button doesn't work
**Check:**
- Image is uploaded (uploadedImage exists)
- Product is selected (selectedProduct exists)
- No JavaScript errors in console

### Issue: Garment doesn't show
**Check:**
- Garment image URL is accessible
- CORS is enabled for external images
- Image loads in new tab when pasted

## Test Products Available
1. Classic White Shirt
2. Navy Blue Shirt  
3. Red T-Shirt
4. Green T-Shirt
5. Black Jacket
6. Purple Dress

All products have working image URLs and should process correctly.