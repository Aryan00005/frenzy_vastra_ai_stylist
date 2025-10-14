export class FaceTrackingEngine {
  constructor() {
    this.isInitialized = false;
    this.detectionInterval = null;
    this.landmarks = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize face tracking:', error);
      this.isInitialized = false;
    }
  }

  async detectFace(videoElement, canvasElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const landmarks = this.estimateFaceLandmarks(imageData, canvas.width, canvas.height);

    this.landmarks = landmarks;
    return landmarks;
  }

  estimateFaceLandmarks(imageData, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    const faceWidth = width * 0.35;
    const faceHeight = height * 0.45;

    return {
      noseBridge: { x: centerX, y: centerY - faceHeight * 0.1 },
      leftEye: { x: centerX - faceWidth * 0.25, y: centerY - faceHeight * 0.15 },
      rightEye: { x: centerX + faceWidth * 0.25, y: centerY - faceHeight * 0.15 },
      leftEar: { x: centerX - faceWidth * 0.5, y: centerY },
      rightEar: { x: centerX + faceWidth * 0.5, y: centerY },
      forehead: { x: centerX, y: centerY - faceHeight * 0.4 },
      chin: { x: centerX, y: centerY + faceHeight * 0.4 },
      leftCheek: { x: centerX - faceWidth * 0.35, y: centerY + faceHeight * 0.1 },
      rightCheek: { x: centerX + faceWidth * 0.35, y: centerY + faceHeight * 0.1 },
      mouth: { x: centerX, y: centerY + faceHeight * 0.2 },
      faceWidth,
      faceHeight
    };
  }

  calculateProductPosition(landmarks, productType) {
    if (!landmarks) return null;

    switch (productType) {
      case 'eyewear':
      case 'glasses':
      case 'sunglasses':
        return this.calculateEyewearPosition(landmarks);

      case 'earrings':
        return this.calculateEarringsPosition(landmarks);

      case 'hats':
      case 'caps':
        return this.calculateHatPosition(landmarks);

      case 'necklace':
      case 'jewelry':
        return this.calculateNecklacePosition(landmarks);

      default:
        return this.calculateDefaultPosition(landmarks);
    }
  }

  calculateEyewearPosition(landmarks) {
    const { noseBridge, leftEar, rightEar, leftEye, rightEye, faceWidth } = landmarks;

    const eyeDistance = rightEye.x - leftEye.x;
    const width = eyeDistance * 1.8;
    const height = width * 0.4;

    const x = noseBridge.x;
    const y = (leftEye.y + rightEye.y) / 2;

    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

    return {
      x,
      y,
      width,
      height,
      rotation: angle,
      scale: width / 300
    };
  }

  calculateEarringsPosition(landmarks) {
    const { leftEar, rightEar, faceHeight } = landmarks;

    const earringSize = faceHeight * 0.15;

    return {
      left: {
        x: leftEar.x,
        y: leftEar.y,
        width: earringSize,
        height: earringSize * 1.5,
        rotation: -10
      },
      right: {
        x: rightEar.x,
        y: rightEar.y,
        width: earringSize,
        height: earringSize * 1.5,
        rotation: 10
      }
    };
  }

  calculateHatPosition(landmarks) {
    const { forehead, faceWidth, faceHeight } = landmarks;

    const width = faceWidth * 1.4;
    const height = faceHeight * 0.6;

    return {
      x: forehead.x,
      y: forehead.y - height * 0.5,
      width,
      height,
      rotation: 0,
      scale: 1
    };
  }

  calculateNecklacePosition(landmarks) {
    const { chin, faceWidth } = landmarks;

    const width = faceWidth * 0.8;
    const height = width * 0.3;

    return {
      x: chin.x,
      y: chin.y + height * 0.5,
      width,
      height,
      rotation: 0,
      scale: 1
    };
  }

  calculateDefaultPosition(landmarks) {
    const { noseBridge, faceWidth, faceHeight } = landmarks;

    return {
      x: noseBridge.x,
      y: noseBridge.y,
      width: faceWidth * 0.6,
      height: faceHeight * 0.3,
      rotation: 0,
      scale: 1
    };
  }

  dispose() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.landmarks = null;
  }
}
