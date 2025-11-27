// Advanced body detection utilities for virtual try-on

export class BodyDetector {
  constructor() {
    this.skinRanges = [
      { r: [95, 255], g: [40, 200], b: [20, 150] },   // Light skin
      { r: [80, 220], g: [35, 180], b: [15, 120] },   // Medium skin  
      { r: [45, 180], g: [25, 150], b: [10, 100] },   // Dark skin
      { r: [120, 255], g: [60, 220], b: [30, 180] }   // Very light skin
    ];
  }

  // Detect body landmarks from image
  detectBodyLandmarks(imageData, width, height) {
    const skinPixels = this.findSkinPixels(imageData, width, height);
    
    if (skinPixels.length < 100) {
      return this.createFallbackLandmarks(width, height);
    }

    return this.calculateBodyLandmarks(skinPixels, width, height);
  }

  // Find skin-colored pixels
  findSkinPixels(data, width, height) {
    const skinPixels = [];
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];
      
      if (this.isSkinTone(r, g, b)) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        skinPixels.push({ x, y, intensity: r + g + b });
      }
    }
    
    return skinPixels;
  }

  // Enhanced skin tone detection
  isSkinTone(r, g, b) {
    // Check multiple skin tone ranges
    const inRange = this.skinRanges.some(range => 
      r >= range.r[0] && r <= range.r[1] &&
      g >= range.g[0] && g <= range.g[1] &&
      b >= range.b[0] && b <= range.b[1]
    );

    if (!inRange) return false;

    // Additional skin tone validation
    const maxRGB = Math.max(r, g, b);
    const minRGB = Math.min(r, g, b);
    
    return (
      maxRGB - minRGB > 15 &&  // Sufficient color variation
      Math.abs(r - g) > 10 &&  // Red-green difference
      r > g && r > b           // Red dominance
    );
  }

  // Calculate body landmarks from skin pixels
  calculateBodyLandmarks(skinPixels, width, height) {
    // Sort by Y coordinate to find head/body regions
    skinPixels.sort((a, b) => a.y - b.y);
    
    const topPixels = skinPixels.slice(0, Math.floor(skinPixels.length * 0.3));
    const middlePixels = skinPixels.slice(
      Math.floor(skinPixels.length * 0.3), 
      Math.floor(skinPixels.length * 0.7)
    );
    
    // Find head region (top 30% of skin pixels)
    const headRegion = this.analyzeRegion(topPixels);
    
    // Find torso region (middle 40% of skin pixels)  
    const torsoRegion = this.analyzeRegion(middlePixels);
    
    // Calculate landmarks
    const landmarks = {
      head: {
        centerX: headRegion.centerX,
        centerY: headRegion.centerY,
        width: headRegion.width,
        height: headRegion.height
      },
      shoulders: {
        left: torsoRegion.left,
        right: torsoRegion.right,
        y: torsoRegion.top,
        width: torsoRegion.width
      },
      torso: {
        centerX: torsoRegion.centerX,
        centerY: torsoRegion.centerY,
        width: torsoRegion.width,
        height: torsoRegion.height,
        top: torsoRegion.top,
        bottom: torsoRegion.bottom
      }
    };

    return landmarks;
  }

  // Analyze a region of pixels
  analyzeRegion(pixels) {
    if (pixels.length === 0) {
      return { centerX: 0, centerY: 0, width: 0, height: 0, left: 0, right: 0, top: 0, bottom: 0 };
    }

    const xs = pixels.map(p => p.x);
    const ys = pixels.map(p => p.y);
    
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    
    return {
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
      width: right - left,
      height: bottom - top,
      left, right, top, bottom
    };
  }

  // Fallback landmarks when detection fails
  createFallbackLandmarks(width, height) {
    return {
      head: {
        centerX: width * 0.5,
        centerY: height * 0.15,
        width: width * 0.15,
        height: height * 0.12
      },
      shoulders: {
        left: width * 0.35,
        right: width * 0.65,
        y: height * 0.25,
        width: width * 0.3
      },
      torso: {
        centerX: width * 0.5,
        centerY: width * 0.4,
        width: width * 0.3,
        height: height * 0.35,
        top: height * 0.25,
        bottom: height * 0.6
      }
    };
  }

  // Calculate garment fitting area based on product type
  calculateGarmentFit(landmarks, productType, productData) {
    const { shoulders, torso } = landmarks;
    
    let fitArea;
    
    switch (productType) {
      case 'dress':
        fitArea = {
          x: shoulders.left - torso.width * 0.1,
          y: shoulders.y,
          width: shoulders.width + torso.width * 0.2,
          height: torso.height * 1.8
        };
        break;
        
      case 'jacket':
      case 'blazer':
        fitArea = {
          x: shoulders.left - torso.width * 0.15,
          y: shoulders.y - torso.height * 0.05,
          width: shoulders.width + torso.width * 0.3,
          height: torso.height * 0.8
        };
        break;
        
      case 'shirt':
      case 'tshirt':
      default:
        fitArea = {
          x: shoulders.left - torso.width * 0.05,
          y: shoulders.y + torso.height * 0.02,
          width: shoulders.width + torso.width * 0.1,
          height: torso.height * 0.7
        };
        break;
    }
    
    return fitArea;
  }

  // Apply realistic garment deformation
  applyGarmentDeformation(ctx, garmentCanvas, fitArea, landmarks) {
    const { torso } = landmarks;
    
    // Calculate body curvature
    const bodySkew = (torso.centerX - (fitArea.x + fitArea.width / 2)) * 0.03;
    const bodyTaper = Math.abs(torso.centerX - (fitArea.x + fitArea.width / 2)) * 0.001;
    
    // Apply transformation
    ctx.save();
    ctx.setTransform(
      1 - bodyTaper, 0,
      bodySkew / fitArea.width, 1,
      fitArea.x, fitArea.y
    );
    
    ctx.drawImage(garmentCanvas, 0, 0);
    ctx.restore();
  }

  // Add realistic lighting based on body shape
  addBodyLighting(ctx, landmarks, fitArea) {
    const { torso } = landmarks;
    
    // Shadow on the right side
    const shadowGradient = ctx.createLinearGradient(
      torso.centerX, fitArea.y,
      fitArea.x + fitArea.width, fitArea.y
    );
    shadowGradient.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(torso.centerX, fitArea.y, fitArea.width / 2, fitArea.height);
    ctx.restore();
    
    // Highlight on the left side
    const highlightGradient = ctx.createLinearGradient(
      fitArea.x, fitArea.y,
      torso.centerX, fitArea.y
    );
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(fitArea.x, fitArea.y, fitArea.width / 2, fitArea.height);
    ctx.restore();
  }
}

export const bodyDetector = new BodyDetector();