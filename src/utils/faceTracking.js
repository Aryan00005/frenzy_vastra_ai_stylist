export class FaceTrackingEngine {
  constructor() {
    this.isInitialized = false;
    this.detectionInterval = null;
    this.landmarks = null;
    this.faceMesh = null;
    this.lastDetectionTime = 0;
    this.detectionThrottle = 33; // ~30 FPS
    this.smoothingFactor = 0.3;
    this.previousLandmarks = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Check if FaceMesh is already loaded
      if (typeof window.FaceMesh !== 'undefined') {
        await this.setupFaceMesh();
        return true;
      }

      // Load MediaPipe Face Mesh dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = async () => {
          try {
            await this.setupFaceMesh();
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        script.onerror = () => reject(new Error('Failed to load MediaPipe Face Mesh'));
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize face tracking:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async setupFaceMesh() {
    if (typeof window.FaceMesh === 'undefined') {
      throw new Error('MediaPipe Face Mesh not loaded');
    }

    this.faceMesh = new window.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
      }
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.isInitialized = true;
  }

  async detectFace(videoElement, canvasElement) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return this.estimateFaceLandmarks(
          null,
          videoElement.videoWidth || canvasElement.width,
          videoElement.videoHeight || canvasElement.height
        );
      }
    }

    // Throttle detection for performance
    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionThrottle) {
      return this.landmarks || this.estimateFaceLandmarks(
        null,
        videoElement.videoWidth || canvasElement.width,
        videoElement.videoHeight || canvasElement.height
      );
    }
    this.lastDetectionTime = now;

    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');

    canvas.width = videoElement.videoWidth || videoElement.width || 1280;
    canvas.height = videoElement.videoHeight || videoElement.height || 720;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    try {
      if (this.faceMesh) {
        const results = await this.faceMesh.send({ image: videoElement });
        
        if (results && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.landmarks = this.convertMediaPipeLandmarks(results.multiFaceLandmarks[0], canvas.width, canvas.height);
        } else {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          this.landmarks = this.estimateFaceLandmarks(imageData, canvas.width, canvas.height);
        }
      } else {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.landmarks = this.estimateFaceLandmarks(imageData, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.landmarks = this.estimateFaceLandmarks(imageData, canvas.width, canvas.height);
    }

    // Apply smoothing
    if (this.previousLandmarks) {
      this.landmarks = this.smoothLandmarks(this.landmarks, this.previousLandmarks);
    }
    this.previousLandmarks = JSON.parse(JSON.stringify(this.landmarks));

    return this.landmarks;
  }

  convertMediaPipeLandmarks(faceLandmarks, width, height) {
    // Key landmark indices from MediaPipe Face Mesh
    const NOSE_TIP = 1;
    const LEFT_EYE = 33;
    const RIGHT_EYE = 263;
    const LEFT_EAR = 234;
    const RIGHT_EAR = 454;
    const FOREHEAD = 10;
    const CHIN = 152;
    const LEFT_CHEEK = 50;
    const RIGHT_CHEEK = 280;
    const MOUTH = 13;

    const getLandmark = (index) => ({
      x: faceLandmarks[index].x * width,
      y: faceLandmarks[index].y * height,
      z: faceLandmarks[index].z || 0
    });

    const noseBridge = getLandmark(NOSE_TIP);
    const leftEye = getLandmark(LEFT_EYE);
    const rightEye = getLandmark(RIGHT_EYE);
    const leftEar = getLandmark(LEFT_EAR);
    const rightEar = getLandmark(RIGHT_EAR);
    const forehead = getLandmark(FOREHEAD);
    const chin = getLandmark(CHIN);
    const leftCheek = getLandmark(LEFT_CHEEK);
    const rightCheek = getLandmark(RIGHT_CHEEK);
    const mouth = getLandmark(MOUTH);

    const faceWidth = Math.abs(rightEar.x - leftEar.x);
    const faceHeight = Math.abs(chin.y - forehead.y);

    return {
      noseBridge,
      leftEye,
      rightEye,
      leftEar,
      rightEar,
      forehead,
      chin,
      leftCheek,
      rightCheek,
      mouth,
      faceWidth,
      faceHeight,
      confidence: 0.9
    };
  }

  smoothLandmarks(current, previous) {
    const smoothed = {};
    const alpha = this.smoothingFactor;

    for (const key in current) {
      if (typeof current[key] === 'object' && current[key] !== null && 'x' in current[key]) {
        smoothed[key] = {
          x: previous[key].x + alpha * (current[key].x - previous[key].x),
          y: previous[key].y + alpha * (current[key].y - previous[key].y)
        };
        if ('z' in current[key]) {
          smoothed[key].z = previous[key].z + alpha * (current[key].z - previous[key].z);
        }
      } else {
        smoothed[key] = current[key];
      }
    }

    return smoothed;
  }

  estimateFaceLandmarks(imageData, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    const faceWidth = width * 0.35;
    const faceHeight = height * 0.45;

    return {
      noseBridge: { x: centerX, y: centerY - faceHeight * 0.1, z: 0 },
      leftEye: { x: centerX - faceWidth * 0.25, y: centerY - faceHeight * 0.15, z: 0 },
      rightEye: { x: centerX + faceWidth * 0.25, y: centerY - faceHeight * 0.15, z: 0 },
      leftEar: { x: centerX - faceWidth * 0.5, y: centerY, z: 0 },
      rightEar: { x: centerX + faceWidth * 0.5, y: centerY, z: 0 },
      forehead: { x: centerX, y: centerY - faceHeight * 0.4, z: 0 },
      chin: { x: centerX, y: centerY + faceHeight * 0.4, z: 0 },
      leftCheek: { x: centerX - faceWidth * 0.35, y: centerY + faceHeight * 0.1, z: 0 },
      rightCheek: { x: centerX + faceWidth * 0.35, y: centerY + faceHeight * 0.1, z: 0 },
      mouth: { x: centerX, y: centerY + faceHeight * 0.2, z: 0 },
      faceWidth,
      faceHeight,
      confidence: 0.5
    };
  }

  calculateProductPosition(landmarks, productType) {
    if (!landmarks) return null;

    const minConfidence = 0.4;
    const hasGoodConfidence = landmarks.confidence > minConfidence;

    if (!hasGoodConfidence && this.previousLandmarks) {
      landmarks = this.previousLandmarks;
    }

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

    // Calculate depth for 3D effect
    const depth = (leftEye.z + rightEye.z) / 2;
    const depthScale = 1 + (depth * 0.1);

    return {
      x,
      y,
      width: width * depthScale,
      height: height * depthScale,
      rotation: angle,
      scale: width / 300,
      confidence: landmarks.confidence,
      depth
    };
  }

  calculateEarringsPosition(landmarks) {
    const { leftEar, rightEar, faceHeight } = landmarks;

    const earringSize = faceHeight * 0.15;

    // Calculate depth for each ear
    const leftDepthScale = 1 + (leftEar.z * 0.1);
    const rightDepthScale = 1 + (rightEar.z * 0.1);

    return {
      left: {
        x: leftEar.x,
        y: leftEar.y,
        width: earringSize * leftDepthScale,
        height: earringSize * 1.5 * leftDepthScale,
        rotation: -10,
        confidence: landmarks.confidence
      },
      right: {
        x: rightEar.x,
        y: rightEar.y,
        width: earringSize * rightDepthScale,
        height: earringSize * 1.5 * rightDepthScale,
        rotation: 10,
        confidence: landmarks.confidence
      }
    };
  }

  calculateHatPosition(landmarks) {
    const { forehead, faceWidth, faceHeight, leftEye, rightEye } = landmarks;

    const width = faceWidth * 1.4;
    const height = faceHeight * 0.6;

    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

    return {
      x: forehead.x,
      y: forehead.y - height * 0.5,
      width,
      height,
      rotation: angle,
      scale: 1,
      confidence: landmarks.confidence
    };
  }

  calculateNecklacePosition(landmarks) {
    const { chin, faceWidth, leftEye, rightEye } = landmarks;

    const width = faceWidth * 0.8;
    const height = width * 0.3;

    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

    return {
      x: chin.x,
      y: chin.y + height * 0.5,
      width,
      height,
      rotation: angle,
      scale: 1,
      confidence: landmarks.confidence
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
      scale: 1,
      confidence: landmarks.confidence || 0.5
    };
  }

  dispose() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.landmarks = null;
    this.previousLandmarks = null;
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
  }
}
