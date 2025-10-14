export class BodyTrackingEngine {
  constructor() {
    this.isInitialized = false;
    this.landmarks = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/pose.js';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize body tracking:', error);
      this.isInitialized = false;
    }
  }

  async detectBody(videoElement, canvasElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const landmarks = this.estimateBodyLandmarks(canvas.width, canvas.height);

    this.landmarks = landmarks;
    return landmarks;
  }

  estimateBodyLandmarks(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    const bodyWidth = width * 0.4;
    const bodyHeight = height * 0.7;

    return {
      nose: { x: centerX, y: centerY - bodyHeight * 0.4 },
      neck: { x: centerX, y: centerY - bodyHeight * 0.3 },
      leftShoulder: { x: centerX - bodyWidth * 0.3, y: centerY - bodyHeight * 0.25 },
      rightShoulder: { x: centerX + bodyWidth * 0.3, y: centerY - bodyHeight * 0.25 },
      leftElbow: { x: centerX - bodyWidth * 0.4, y: centerY - bodyHeight * 0.05 },
      rightElbow: { x: centerX + bodyWidth * 0.4, y: centerY - bodyHeight * 0.05 },
      leftWrist: { x: centerX - bodyWidth * 0.45, y: centerY + bodyHeight * 0.15 },
      rightWrist: { x: centerX + bodyWidth * 0.45, y: centerY + bodyHeight * 0.15 },
      leftHip: { x: centerX - bodyWidth * 0.2, y: centerY + bodyHeight * 0.1 },
      rightHip: { x: centerX + bodyWidth * 0.2, y: centerY + bodyHeight * 0.1 },
      leftKnee: { x: centerX - bodyWidth * 0.2, y: centerY + bodyHeight * 0.35 },
      rightKnee: { x: centerX + bodyWidth * 0.2, y: centerY + bodyHeight * 0.35 },
      torsoCenter: { x: centerX, y: centerY },
      bodyWidth,
      bodyHeight
    };
  }

  calculateProductPosition(landmarks, productType, clothingType = 'shirt') {
    if (!landmarks) return null;

    switch (productType) {
      case 'clothing':
        return this.calculateClothingPosition(landmarks, clothingType);

      case 'accessories':
        return this.calculateAccessoryPosition(landmarks, clothingType);

      case 'jewelry':
      case 'necklace':
        return this.calculateNecklacePosition(landmarks);

      case 'scarf':
      case 'scarves':
        return this.calculateScarfPosition(landmarks);

      default:
        return this.calculateDefaultPosition(landmarks);
    }
  }

  calculateClothingPosition(landmarks, clothingType) {
    const { neck, leftShoulder, rightShoulder, leftHip, rightHip, torsoCenter, bodyWidth, bodyHeight } = landmarks;

    if (clothingType === 'shirt' || clothingType === 't-shirt') {
      const width = Math.abs(rightShoulder.x - leftShoulder.x) * 1.2;
      const height = Math.abs((leftHip.y + rightHip.y) / 2 - neck.y);

      return {
        x: torsoCenter.x,
        y: (neck.y + ((leftHip.y + rightHip.y) / 2)) / 2,
        width,
        height,
        rotation: 0,
        scale: 1
      };
    }

    if (clothingType === 'dress' || clothingType === 'gown') {
      const width = bodyWidth * 1.3;
      const height = bodyHeight * 0.9;

      return {
        x: torsoCenter.x,
        y: neck.y + height / 2,
        width,
        height,
        rotation: 0,
        scale: 1
      };
    }

    if (clothingType === 'jacket' || clothingType === 'coat') {
      const width = Math.abs(rightShoulder.x - leftShoulder.x) * 1.4;
      const height = Math.abs((leftHip.y + rightHip.y) / 2 - neck.y) * 1.1;

      return {
        x: torsoCenter.x,
        y: (neck.y + ((leftHip.y + rightHip.y) / 2)) / 2,
        width,
        height,
        rotation: 0,
        scale: 1
      };
    }

    return this.calculateDefaultPosition(landmarks);
  }

  calculateNecklacePosition(landmarks) {
    const { neck, leftShoulder, rightShoulder } = landmarks;

    const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);
    const width = shoulderDistance * 0.7;
    const height = width * 0.3;

    return {
      x: neck.x,
      y: neck.y + height * 0.8,
      width,
      height,
      rotation: 0,
      scale: 1
    };
  }

  calculateScarfPosition(landmarks) {
    const { neck, leftShoulder, rightShoulder } = landmarks;

    const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);
    const width = shoulderDistance * 0.9;
    const height = width * 0.6;

    return {
      x: neck.x,
      y: neck.y + height * 0.3,
      width,
      height,
      rotation: 0,
      scale: 1
    };
  }

  calculateAccessoryPosition(landmarks, accessoryType) {
    if (accessoryType === 'necklace' || accessoryType === 'jewelry') {
      return this.calculateNecklacePosition(landmarks);
    }

    return this.calculateDefaultPosition(landmarks);
  }

  calculateDefaultPosition(landmarks) {
    const { torsoCenter, bodyWidth, bodyHeight } = landmarks;

    return {
      x: torsoCenter.x,
      y: torsoCenter.y,
      width: bodyWidth * 0.6,
      height: bodyHeight * 0.4,
      rotation: 0,
      scale: 1
    };
  }

  dispose() {
    this.landmarks = null;
  }
}
