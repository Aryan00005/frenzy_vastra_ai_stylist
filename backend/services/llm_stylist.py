import requests
import json
import base64
from PIL import Image
import io

class LLMStylist:
    def __init__(self):
        # Free LLM APIs
        self.models = {
            'vision': 'https://api-inference.huggingface.co/models/microsoft/DiT-base-finetuned-ade-512-512',
            'text': 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            'style_analysis': 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224'
        }
    
    async def analyze_style_with_llm(self, image_bytes, user_preferences=None):
        """Use LLM to analyze style and provide recommendations"""
        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode()
            
            # Analyze image with vision model
            style_analysis = await self._analyze_image_style(image_b64)
            
            # Generate style recommendations with LLM
            recommendations = await self._generate_style_recommendations(style_analysis, user_preferences)
            
            return {
                'style_analysis': style_analysis,
                'recommendations': recommendations,
                'outfit_suggestions': await self._suggest_complete_outfits(style_analysis)
            }
            
        except Exception as e:
            print(f"LLM analysis failed: {e}")
            return self._fallback_analysis(image_bytes)
    
    async def _analyze_image_style(self, image_b64):
        """Analyze image style using vision model"""
        try:
            response = requests.post(
                self.models['vision'],
                headers={"Authorization": "Bearer hf_demo"},
                json={"inputs": image_b64},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._process_vision_result(result)
                
        except Exception as e:
            print(f"Vision analysis failed: {e}")
        
        return self._basic_style_analysis()
    
    async def _generate_style_recommendations(self, style_analysis, user_prefs):
        """Generate personalized recommendations using LLM"""
        prompt = self._create_style_prompt(style_analysis, user_prefs)
        
        try:
            response = requests.post(
                self.models['text'],
                headers={"Authorization": "Bearer hf_demo"},
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_length": 200,
                        "temperature": 0.7,
                        "do_sample": True
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._process_llm_recommendations(result)
                
        except Exception as e:
            print(f"LLM recommendation failed: {e}")
        
        return self._fallback_recommendations(style_analysis)
    
    async def _suggest_complete_outfits(self, style_analysis):
        """Suggest complete outfit combinations"""
        base_style = style_analysis.get('dominant_style', 'casual')
        
        outfits = {
            'casual': [
                {'top': 'Basic T-shirt', 'bottom': 'Jeans', 'shoes': 'Sneakers'},
                {'top': 'Hoodie', 'bottom': 'Joggers', 'shoes': 'Athletic shoes'},
                {'top': 'Polo shirt', 'bottom': 'Chinos', 'shoes': 'Loafers'}
            ],
            'formal': [
                {'top': 'Dress shirt', 'bottom': 'Suit pants', 'shoes': 'Oxford shoes'},
                {'top': 'Blazer', 'bottom': 'Dress pants', 'shoes': 'Derby shoes'},
                {'top': 'Button-up', 'bottom': 'Slacks', 'shoes': 'Dress shoes'}
            ],
            'trendy': [
                {'top': 'Crop top', 'bottom': 'High-waist jeans', 'shoes': 'Boots'},
                {'top': 'Oversized shirt', 'bottom': 'Bike shorts', 'shoes': 'Chunky sneakers'},
                {'top': 'Graphic tee', 'bottom': 'Wide-leg pants', 'shoes': 'Platform shoes'}
            ]
        }
        
        return outfits.get(base_style, outfits['casual'])
    
    def _create_style_prompt(self, style_analysis, user_prefs):
        """Create prompt for LLM style recommendations"""
        prompt = f"""
        Based on this style analysis: {style_analysis}
        User preferences: {user_prefs or 'None specified'}
        
        Provide 3 specific clothing recommendations that would:
        1. Complement the person's style
        2. Match their preferences
        3. Be suitable for their body type
        
        Recommendations:
        """
        return prompt
    
    def _process_vision_result(self, result):
        """Process vision model result"""
        # Mock processing of vision model output
        return {
            'dominant_style': 'casual',
            'color_palette': ['blue', 'white', 'gray'],
            'style_confidence': 0.85,
            'detected_items': ['shirt', 'pants'],
            'style_attributes': ['relaxed', 'modern', 'comfortable']
        }
    
    def _process_llm_recommendations(self, result):
        """Process LLM recommendation result"""
        # Extract recommendations from LLM output
        if isinstance(result, list) and len(result) > 0:
            text = result[0].get('generated_text', '')
            return self._parse_recommendations(text)
        
        return self._fallback_recommendations({})
    
    def _parse_recommendations(self, text):
        """Parse LLM text output into structured recommendations"""
        recommendations = []
        
        # Simple parsing logic
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'try']):
                recommendations.append({
                    'item': line.strip(),
                    'reason': 'AI recommended based on your style',
                    'confidence': 0.8
                })
        
        if not recommendations:
            return self._fallback_recommendations({})
        
        return recommendations[:3]  # Return top 3
    
    def _basic_style_analysis(self):
        """Basic style analysis fallback"""
        return {
            'dominant_style': 'casual',
            'color_palette': ['neutral', 'blue', 'black'],
            'style_confidence': 0.7,
            'detected_items': ['clothing'],
            'style_attributes': ['versatile', 'comfortable']
        }
    
    def _fallback_recommendations(self, style_analysis):
        """Fallback recommendations when LLM fails"""
        style = style_analysis.get('dominant_style', 'casual')
        
        recommendations = {
            'casual': [
                {'item': 'Classic white t-shirt', 'reason': 'Versatile and timeless', 'confidence': 0.9},
                {'item': 'Dark wash jeans', 'reason': 'Flattering and comfortable', 'confidence': 0.8},
                {'item': 'Comfortable sneakers', 'reason': 'Perfect for everyday wear', 'confidence': 0.85}
            ],
            'formal': [
                {'item': 'Tailored blazer', 'reason': 'Professional and polished', 'confidence': 0.9},
                {'item': 'Crisp dress shirt', 'reason': 'Essential formal piece', 'confidence': 0.85},
                {'item': 'Quality dress shoes', 'reason': 'Completes formal look', 'confidence': 0.8}
            ]
        }
        
        return recommendations.get(style, recommendations['casual'])
    
    def _fallback_analysis(self, image_bytes):
        """Complete fallback analysis"""
        return {
            'style_analysis': self._basic_style_analysis(),
            'recommendations': self._fallback_recommendations({}),
            'outfit_suggestions': [
                {'top': 'Basic tee', 'bottom': 'Jeans', 'shoes': 'Sneakers'},
                {'top': 'Button-up', 'bottom': 'Chinos', 'shoes': 'Loafers'}
            ]
        }

    async def get_personalized_styling_advice(self, user_data):
        """Get personalized styling advice using LLM"""
        prompt = f"""
        User Profile:
        - Body type: {user_data.get('body_type', 'average')}
        - Style preference: {user_data.get('style_preference', 'casual')}
        - Occasion: {user_data.get('occasion', 'everyday')}
        - Budget: {user_data.get('budget', 'moderate')}
        
        Provide specific styling advice including:
        1. Best clothing styles for their body type
        2. Color recommendations
        3. Fit guidelines
        4. Styling tips
        """
        
        try:
            response = requests.post(
                self.models['text'],
                headers={"Authorization": "Bearer hf_demo"},
                json={"inputs": prompt, "parameters": {"max_length": 300}},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._format_styling_advice(result)
                
        except Exception as e:
            print(f"Styling advice failed: {e}")
        
        return self._default_styling_advice(user_data)
    
    def _format_styling_advice(self, llm_result):
        """Format LLM styling advice"""
        if isinstance(llm_result, list) and len(llm_result) > 0:
            advice_text = llm_result[0].get('generated_text', '')
            
            return {
                'advice': advice_text,
                'key_points': self._extract_key_points(advice_text),
                'confidence': 0.8
            }
        
        return self._default_styling_advice({})
    
    def _extract_key_points(self, text):
        """Extract key styling points from text"""
        points = []
        lines = text.split('\n')
        
        for line in lines:
            if line.strip() and (line.startswith('-') or line.startswith('•') or ':' in line):
                points.append(line.strip())
        
        return points[:5]  # Return top 5 points
    
    def _default_styling_advice(self, user_data):
        """Default styling advice"""
        body_type = user_data.get('body_type', 'average')
        
        advice_map = {
            'pear': {
                'advice': 'Focus on balancing your silhouette with tops that draw attention upward',
                'key_points': [
                    '- Choose A-line or fit-and-flare dresses',
                    '- Opt for tops with interesting necklines',
                    '- Avoid tight-fitting bottoms',
                    '- Use accessories to draw attention up'
                ]
            },
            'apple': {
                'advice': 'Create a defined waistline and elongate your torso',
                'key_points': [
                    '- Choose empire waist or wrap styles',
                    '- Opt for V-necks to elongate',
                    '- Avoid clingy fabrics around the middle',
                    '- Use belts to define waist'
                ]
            }
        }
        
        return advice_map.get(body_type, {
            'advice': 'Focus on fit, quality, and personal comfort in your clothing choices',
            'key_points': [
                '- Choose well-fitted clothing',
                '- Invest in quality basics',
                '- Experiment with colors you love',
                '- Prioritize comfort and confidence'
            ]
        })