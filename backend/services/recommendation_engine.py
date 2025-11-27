import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import json

class RecommendationEngine:
    def __init__(self):
        self.products_db = self._load_products()
        self.user_profiles = {}
        
    def _load_products(self):
        # Mock product database
        return [
            {
                'id': 1, 'name': 'Classic White T-Shirt', 'category': 'tops',
                'colors': ['white', 'black', 'gray'], 'fit': 'regular',
                'style': ['casual', 'classic'], 'price': 25.99,
                'body_types': ['rectangle', 'hourglass', 'pear'],
                'occasions': ['casual', 'everyday']
            },
            {
                'id': 2, 'name': 'Slim Fit Jeans', 'category': 'bottoms',
                'colors': ['blue', 'black', 'gray'], 'fit': 'slim',
                'style': ['casual', 'modern'], 'price': 79.99,
                'body_types': ['rectangle', 'inverted_triangle'],
                'occasions': ['casual', 'date_night']
            },
            {
                'id': 3, 'name': 'Floral Summer Dress', 'category': 'dresses',
                'colors': ['floral', 'pink', 'blue'], 'fit': 'A-line',
                'style': ['bohemian', 'feminine'], 'price': 89.99,
                'body_types': ['pear', 'hourglass', 'apple'],
                'occasions': ['casual', 'date_night', 'summer']
            }
        ]
    
    async def generate_recommendations(self, user_data):
        # Extract user preferences
        body_type = user_data.get('body_type', 'rectangle')
        style_preferences = user_data.get('style_preferences', ['casual'])
        occasion = user_data.get('occasion', 'casual')
        color_preferences = user_data.get('color_palette', [])
        budget_range = user_data.get('budget_range', [0, 1000])
        
        # Score products based on user preferences
        scored_products = []
        
        for product in self.products_db:
            score = self._calculate_product_score(
                product, body_type, style_preferences, 
                occasion, color_preferences, budget_range
            )
            
            if score > 0:
                scored_products.append({
                    **product,
                    'recommendation_score': score,
                    'match_reasons': self._get_match_reasons(
                        product, body_type, style_preferences, occasion
                    )
                })
        
        # Sort by score and return top recommendations
        scored_products.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return {
            'recommendations': scored_products[:10],
            'total_matches': len(scored_products),
            'user_profile': {
                'body_type': body_type,
                'style_preferences': style_preferences,
                'occasion': occasion
            }
        }
    
    def _calculate_product_score(self, product, body_type, style_prefs, occasion, colors, budget):
        score = 0
        
        # Body type compatibility (40% weight)
        if body_type in product.get('body_types', []):
            score += 40
        
        # Style preference match (30% weight)
        style_overlap = len(set(style_prefs) & set(product.get('style', [])))
        score += (style_overlap / max(len(style_prefs), 1)) * 30
        
        # Occasion match (20% weight)
        if occasion in product.get('occasions', []):
            score += 20
        
        # Price within budget (10% weight)
        price = product.get('price', 0)
        if budget[0] <= price <= budget[1]:
            score += 10
        
        # Color preference bonus
        if colors:
            color_match = any(color in str(product.get('colors', [])).lower() 
                            for color in colors)
            if color_match:
                score += 5
        
        return score
    
    def _get_match_reasons(self, product, body_type, style_prefs, occasion):
        reasons = []
        
        if body_type in product.get('body_types', []):
            reasons.append(f"Perfect for {body_type} body type")
        
        style_matches = set(style_prefs) & set(product.get('style', []))
        if style_matches:
            reasons.append(f"Matches your {', '.join(style_matches)} style")
        
        if occasion in product.get('occasions', []):
            reasons.append(f"Great for {occasion} occasions")
        
        return reasons
    
    def update_user_preferences(self, user_id, interaction_data):
        # Update user profile based on interactions
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                'liked_products': [],
                'viewed_products': [],
                'purchased_products': [],
                'style_evolution': []
            }
        
        profile = self.user_profiles[user_id]
        
        if interaction_data.get('action') == 'like':
            profile['liked_products'].append(interaction_data['product_id'])
        elif interaction_data.get('action') == 'view':
            profile['viewed_products'].append(interaction_data['product_id'])
        elif interaction_data.get('action') == 'purchase':
            profile['purchased_products'].append(interaction_data['product_id'])
        
        return profile
    
    def get_trending_products(self, category=None, limit=10):
        # Mock trending algorithm
        trending = self.products_db.copy()
        
        if category:
            trending = [p for p in trending if p.get('category') == category]
        
        # Add mock popularity scores
        for product in trending:
            product['popularity_score'] = np.random.uniform(0.5, 1.0)
        
        trending.sort(key=lambda x: x['popularity_score'], reverse=True)
        return trending[:limit]