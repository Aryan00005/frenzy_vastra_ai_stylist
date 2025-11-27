import cv2
import numpy as np
from PIL import Image
import io
from sklearn.cluster import KMeans
import colorsys

class StyleAnalyzer:
    def __init__(self):
        self.body_types = ['rectangle', 'pear', 'apple', 'hourglass', 'inverted_triangle']
        self.style_categories = ['casual', 'formal', 'sporty', 'bohemian', 'classic']
        
    async def analyze_image(self, image_bytes):
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image_np = np.array(image)
        
        # Perform analysis
        body_type = self._analyze_body_type(image_np)
        skin_tone = self._analyze_skin_tone(image_np)
        color_palette = self._extract_color_palette(image_np)
        style_preferences = self._predict_style_preferences(image_np)
        
        return {
            'body_type': body_type,
            'skin_tone': skin_tone,
            'color_palette': color_palette,
            'style_preferences': style_preferences,
            'recommendations': self._generate_style_recommendations(body_type, skin_tone, color_palette)
        }
    
    def _analyze_body_type(self, image):
        # Simplified body type analysis
        h, w = image.shape[:2]
        
        # Mock analysis based on image dimensions and ratios
        aspect_ratio = w / h
        
        if aspect_ratio > 0.7:
            return 'rectangle'
        elif aspect_ratio > 0.6:
            return 'pear'
        elif aspect_ratio > 0.5:
            return 'hourglass'
        else:
            return 'inverted_triangle'
    
    def _analyze_skin_tone(self, image):
        # Extract skin tone from face region (simplified)
        h, w = image.shape[:2]
        
        # Focus on center region (likely face area)
        face_region = image[h//4:3*h//4, w//4:3*w//4]
        
        # Calculate average color
        avg_color = np.mean(face_region.reshape(-1, 3), axis=0)
        
        # Convert to HSV for better skin tone analysis
        hsv = colorsys.rgb_to_hsv(avg_color[0]/255, avg_color[1]/255, avg_color[2]/255)
        
        # Classify skin tone
        if hsv[2] > 0.7:  # High brightness
            return 'light'
        elif hsv[2] > 0.4:
            return 'medium'
        else:
            return 'dark'
    
    def _extract_color_palette(self, image):
        # Extract dominant colors using K-means
        pixels = image.reshape(-1, 3)
        
        # Use K-means to find dominant colors
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        colors = kmeans.cluster_centers_.astype(int)
        
        # Convert to hex
        hex_colors = ['#{:02x}{:02x}{:02x}'.format(r, g, b) for r, g, b in colors]
        
        return hex_colors
    
    def _predict_style_preferences(self, image):
        # Mock style prediction based on color analysis
        avg_brightness = np.mean(image)
        color_variance = np.var(image)
        
        if avg_brightness > 150 and color_variance < 1000:
            return ['casual', 'classic']
        elif avg_brightness < 100:
            return ['formal', 'classic']
        elif color_variance > 2000:
            return ['bohemian', 'sporty']
        else:
            return ['casual', 'sporty']
    
    def _generate_style_recommendations(self, body_type, skin_tone, color_palette):
        recommendations = {
            'clothing_types': [],
            'colors': [],
            'patterns': [],
            'fits': []
        }
        
        # Body type specific recommendations
        if body_type == 'pear':
            recommendations['clothing_types'] = ['A-line dresses', 'bootcut jeans', 'wide-leg pants']
            recommendations['fits'] = ['loose_top', 'fitted_bottom']
        elif body_type == 'apple':
            recommendations['clothing_types'] = ['empire waist dresses', 'straight-leg pants', 'V-neck tops']
            recommendations['fits'] = ['loose_middle', 'fitted_legs']
        elif body_type == 'hourglass':
            recommendations['clothing_types'] = ['fitted dresses', 'high-waisted pants', 'wrap tops']
            recommendations['fits'] = ['fitted', 'tailored']
        else:
            recommendations['clothing_types'] = ['straight dresses', 'skinny jeans', 'fitted tops']
            recommendations['fits'] = ['fitted', 'slim']
        
        # Skin tone specific color recommendations
        if skin_tone == 'light':
            recommendations['colors'] = ['pastels', 'jewel_tones', 'cool_colors']
        elif skin_tone == 'medium':
            recommendations['colors'] = ['earth_tones', 'warm_colors', 'neutrals']
        else:
            recommendations['colors'] = ['bright_colors', 'bold_patterns', 'metallics']
        
        recommendations['patterns'] = ['solid', 'stripes', 'florals']
        
        return recommendations