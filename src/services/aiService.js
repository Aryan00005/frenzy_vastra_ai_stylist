// New AI Service for direct Python backend communication
class AIService {
  constructor() {
    this.pythonBackendUrl = 'http://localhost:8002';
    this.proxyUrl = 'http://localhost:3001';
  }

  async analyzeStyle(imageFile, userPreferences = {}) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('user_preferences', JSON.stringify(userPreferences));

      const response = await fetch(`${this.pythonBackendUrl}/api/analyze-style`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Style analysis failed');
    } catch (error) {
      console.error('Style analysis error:', error);
      return this.fallbackStyleAnalysis();
    }
  }

  async getRecommendations(userData) {
    try {
      const response = await fetch(`${this.pythonBackendUrl}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Recommendations failed');
    } catch (error) {
      console.error('Recommendations error:', error);
      return this.fallbackRecommendations();
    }
  }

  async getOutfitSuggestions(styleData) {
    try {
      const response = await fetch(`${this.pythonBackendUrl}/api/outfit-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(styleData)
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Outfit suggestions failed');
    } catch (error) {
      console.error('Outfit suggestions error:', error);
      return this.fallbackOutfits();
    }
  }

  fallbackStyleAnalysis() {
    return {
      llm_analysis: {
        style_analysis: {
          dominant_style: 'casual',
          color_palette: ['blue', 'white', 'gray'],
          style_confidence: 0.7
        },
        recommendations: [
          { item: 'Classic white t-shirt', reason: 'Versatile and timeless', confidence: 0.9 },
          { item: 'Dark wash jeans', reason: 'Flattering and comfortable', confidence: 0.8 }
        ]
      }
    };
  }

  fallbackRecommendations() {
    return {
      ml_recommendations: {
        recommendations: [
          { name: 'Basic T-Shirt', match_reasons: ['Perfect for casual style'] },
          { name: 'Slim Jeans', match_reasons: ['Great fit for your body type'] }
        ]
      },
      styling_advice: {
        advice: 'Focus on well-fitted basics',
        key_points: ['Choose quality over quantity', 'Invest in versatile pieces']
      }
    };
  }

  fallbackOutfits() {
    return {
      outfit_suggestions: [
        { top: 'Basic T-shirt', bottom: 'Jeans', shoes: 'Sneakers' },
        { top: 'Button-up', bottom: 'Chinos', shoes: 'Loafers' }
      ]
    };
  }
}

export const aiService = new AIService();