import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const StylingTips = ({ 
  occasion = "casual",
  bodyType = "",
  product = {},
  aiTips = []
}) => {
  const occasionStyling = {
    casual: {
      title: "Casual Styling",
      icon: "Coffee",
      tips: [
        "Pair with dark jeans or chinos for a relaxed look",
        "Add a denim jacket or cardigan for layering",
        "Complete with sneakers or casual loafers",
        "Roll up sleeves for a more laid-back vibe"
      ],
      complementaryItems: [
        { name: "Dark Wash Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop" },
        { name: "White Sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" },
        { name: "Denim Jacket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop" }
      ]
    },
    office: {
      title: "Office Styling",
      icon: "Briefcase",
      tips: [
        "Tuck into tailored trousers for a professional look",
        "Layer with a blazer or sport coat",
        "Choose dress shoes or clean leather sneakers",
        "Keep colors neutral and sophisticated"
      ],
      complementaryItems: [
        { name: "Dress Pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" },
        { name: "Blazer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
        { name: "Dress Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" }
      ]
    },
    party: {
      title: "Party Styling",
      icon: "Music",
      tips: [
        "Go for bold colors or interesting patterns",
        "Pair with dark jeans or leather pants",
        "Add statement accessories like a watch or chain",
        "Choose stylish boots or dress sneakers"
      ],
      complementaryItems: [
        { name: "Black Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop" },
        { name: "Leather Jacket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop" },
        { name: "Boots", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" }
      ]
    },
    sports: {
      title: "Sports Styling",
      icon: "Dumbbell",
      tips: [
        "Choose moisture-wicking fabrics for comfort",
        "Pair with athletic shorts or joggers",
        "Add a zip-up hoodie for warm-ups",
        "Complete with performance sneakers"
      ],
      complementaryItems: [
        { name: "Athletic Shorts", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" },
        { name: "Running Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" },
        { name: "Sports Watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" }
      ]
    },
    wedding: {
      title: "Wedding/Festival Styling",
      icon: "Heart",
      tips: [
        "Choose elegant colors like navy, burgundy, or cream",
        "Pair with dress pants or chinos",
        "Add a vest or formal jacket",
        "Complete with dress shoes and minimal accessories"
      ],
      complementaryItems: [
        { name: "Dress Pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" },
        { name: "Dress Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" },
        { name: "Formal Watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" }
      ]
    },
    travel: {
      title: "Travel Styling",
      icon: "Plane",
      tips: [
        "Choose wrinkle-resistant and comfortable fabrics",
        "Layer with a light jacket or cardigan",
        "Pair with comfortable pants or shorts",
        "Opt for versatile shoes suitable for walking"
      ],
      complementaryItems: [
        { name: "Travel Pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop" },
        { name: "Walking Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" },
        { name: "Light Jacket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop" }
      ]
    }
  };

  const currentStyling = occasionStyling?.[occasion] || occasionStyling?.casual;

  const bodyTypeTips = {
    athletic: "Your athletic build looks great in fitted styles that show your physique",
    slim: "Try layering and structured fits to add visual weight and dimension",
    average: "Most fits work well for you - experiment with different styles",
    broad: "V-necks and vertical patterns help create a balanced silhouette",
    tall: "Horizontal stripes and layering can add visual interest",
    short: "Vertical lines and fitted styles help elongate your frame"
  };

  return (
    <div className="space-y-6">
      {/* AI Styling Header */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Sparkles" size={20} color="var(--color-accent)" />
          <h2 className="text-lg font-semibold text-accent">AI Styling Assistant</h2>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <Icon name={currentStyling?.icon} size={16} color="var(--color-text-secondary)" />
          <span className="font-medium text-primary">{currentStyling?.title}</span>
        </div>
        
        {bodyType && (
          <p className="text-sm text-text-secondary">
            {bodyTypeTips?.[bodyType?.toLowerCase()] || "Personalized styling recommendations based on your analysis"}
          </p>
        )}
      </div>
      {/* Custom AI Tips */}
      {aiTips?.length > 0 && (
        <div>
          <h3 className="font-medium text-primary mb-3 flex items-center space-x-2">
            <Icon name="Brain" size={16} color="var(--color-accent)" />
            <span>Personalized Tips</span>
          </h3>
          <div className="space-y-2">
            {aiTips?.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                <Icon name="Lightbulb" size={14} color="var(--color-warning)" className="mt-0.5 flex-shrink-0" />
                <p className="text-sm text-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Occasion-Specific Tips */}
      <div>
        <h3 className="font-medium text-primary mb-3">Styling Tips</h3>
        <div className="space-y-2">
          {currentStyling?.tips?.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
              <p className="text-sm text-text-secondary">{tip}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Complementary Items */}
      <div>
        <h3 className="font-medium text-primary mb-3">Complete the Look</h3>
        <div className="grid grid-cols-1 gap-3">
          {currentStyling?.complementaryItems?.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-border/50 transition-smooth">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface">
                <Image
                  src={item?.image}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{item?.name}</p>
                <p className="text-xs text-text-secondary">Recommended pairing</p>
              </div>
              <Icon name="Plus" size={14} color="var(--color-text-secondary)" />
            </div>
          ))}
        </div>
      </div>
      {/* Care Instructions */}
      <div>
        <h3 className="font-medium text-primary mb-3">Care Instructions</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <Icon name="Droplets" size={14} color="var(--color-text-secondary)" />
            <span className="text-xs text-text-secondary">Machine wash cold</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <Icon name="Sun" size={14} color="var(--color-text-secondary)" />
            <span className="text-xs text-text-secondary">Tumble dry low</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <Icon name="Zap" size={14} color="var(--color-text-secondary)" />
            <span className="text-xs text-text-secondary">Do not bleach</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <Icon name="Flame" size={14} color="var(--color-text-secondary)" />
            <span className="text-xs text-text-secondary">Iron medium heat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylingTips;