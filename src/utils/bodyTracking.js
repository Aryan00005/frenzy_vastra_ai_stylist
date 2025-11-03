export class BodyTrackingEngine {
  constructor() {
    this.isInitialized = false;
    this.landmarks = null;
    this.pose = null;
    this.lastDetectionTime = 0;
    this.detectionThrottle = 33; // ~30 FPS
    this.smoothingFactor = 0.3; // Lower = smoother but more lag
    this.previousLandmarks = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Check if Pose is already loaded
      if (typeof window.Pose !== 'undefined') {
        await this.setupPose();
        return true;
      }

      // Load MediaPipe Pose dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/pose.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = async () => {
          try {
            await this.setupPose();
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        script.onerror = () => reject(new Error('Failed to load MediaPipe Pose'));
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize body tracking:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async setupPose() {
    if (typeof window.Pose === 'undefined') {
      throw new Error('MediaPipe Pose not loaded');
    }

    this.pose = new window.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`;
      }
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.isInitialized = true;
  }

  async detectBody(videoElement, canvasElement) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return this.estimateBodyLandmarks(
          videoElement.videoWidth || canvasElement.width,
          videoElement.videoHeight || canvasElement.height
        );
      }
    }

    // Throttle detection for performance
    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionThrottle) {
      return this.landmarks || this.estimateBodyLandmarks(
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
      if (this.pose) {
        const results = await this.pose.send({ image: videoElement });
        
        if (results && results.poseLandmarks && results.poseLandmarks.length > 0) {
          this.landmarks = this.convertMediaPipeLandmarks(results.poseLandmarks, canvas.width, canvas.height);
        } else {
          this.landmarks = this.estimateBodyLandmarks(canvas.width, canvas.height);
        }
      } else {
        this.landmarks = this.estimateBodyLandmarks(canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Body detection error:', error);
      this.landmarks = this.estimateBodyLandmarks(canvas.width, canvas.height);
    }

    // Apply smoothing
    if (this.previousLandmarks) {
      this.landmarks = this.smoothLandmarks(this.landmarks, this.previousLandmarks);
    }
    this.previousLandmarks = JSON.parse(JSON.stringify(this.landmarks));

    return this.landmarks;
  }

  convertMediaPipeLandmarks(poseLandmarks, width, height) {
    // MediaPipe Pose landmark indices
    const NOSE = 0;
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_ELBOW = 13;
    const RIGHT_ELBOW = 14;
    const LEFT_WRIST = 15;
    const RIGHT_WRIST = 16;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;

    const getLandmark = (index) => ({
      x: poseLandmarks[index].x * width,
      y: poseLandmarks[index].y * height,
      visibility: poseLandmarks[index].visibility || 0
    });

    const nose = getLandmark(NOSE);
    const leftShoulder = getLandmark(LEFT_SHOULDER);
    const rightShoulder = getLandmark(RIGHT_SHOULDER);
    const leftElbow = getLandmark(LEFT_ELBOW);
    const rightElbow = getLandmark(RIGHT_ELBOW);
    const leftWrist = getLandmark(LEFT_WRIST);
    const rightWrist = getLandmark(RIGHT_WRIST);
    const leftHip = getLandmark(LEFT_HIP);
    const rightHip = getLandmark(RIGHT_HIP);
    const leftKnee = getLandmark(LEFT_KNEE);
    const rightKnee = getLandmark(RIGHT_KNEE);

    const neckX = (leftShoulder.x + rightShoulder.x) / 2;
    const neckY = (leftShoulder.y + rightShoulder.y) / 2;
    const torsoCenterX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const torsoCenterY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;

    const bodyWidth = Math.abs(rightShoulder.x - leftShoulder.x) * 1.5;
    const bodyHeight = Math.abs(((leftHip.y + rightHip.y) / 2) - neckY) * 1.3;

    return {
      nose,
      neck: { x: neckX, y: neckY },
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftWrist,
      rightWrist,
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
      torsoCenter: { x: torsoCenterX, y: torsoCenterY },
      bodyWidth,
      bodyHeight
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
        if ('visibility' in current[key]) {
          smoothed[key].visibility = current[key].visibility;
        }
      } else {
        smoothed[key] = current[key];
      }
    }

    return smoothed;
  }

  estimateBodyLandmarks(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    const bodyWidth = width * 0.4;
    const bodyHeight = height * 0.7;

    return {
      nose: { x: centerX, y: centerY - bodyHeight * 0.4, visibility: 1 },
      neck: { x: centerX, y: centerY - bodyHeight * 0.3, visibility: 1 },
      leftShoulder: { x: centerX - bodyWidth * 0.3, y: centerY - bodyHeight * 0.25, visibility: 1 },
      rightShoulder: { x: centerX + bodyWidth * 0.3, y: centerY - bodyHeight * 0.25, visibility: 1 },
      leftElbow: { x: centerX - bodyWidth * 0.4, y: centerY - bodyHeight * 0.05, visibility: 1 },
      rightElbow: { x: centerX + bodyWidth * 0.4, y: centerY - bodyHeight * 0.05, visibility: 1 },
      leftWrist: { x: centerX - bodyWidth * 0.45, y: centerY + bodyHeight * 0.15, visibility: 1 },
      rightWrist: { x: centerX + bodyWidth * 0.45, y: centerY + bodyHeight * 0.15, visibility: 1 },
      leftHip: { x: centerX - bodyWidth * 0.2, y: centerY + bodyHeight * 0.1, visibility: 1 },
      rightHip: { x: centerX + bodyWidth * 0.2, y: centerY + bodyHeight * 0.1, visibility: 1 },
      leftKnee: { x: centerX - bodyWidth * 0.2, y: centerY + bodyHeight * 0.35, visibility: 1 },
      rightKnee: { x: centerX + bodyWidth * 0.2, y: centerY + bodyHeight * 0.35, visibility: 1 },
      torsoCenter: { x: centerX, y: centerY, visibility: 1 },
      bodyWidth,
      bodyHeight
    };
  }

  calculateProductPosition(landmarks, productType, clothingType = 'shirt') {
    if (!landmarks) return null;

    // Check visibility threshold
    const minVisibility = 0.3;
    const hasGoodVisibility = landmarks.leftShoulder?.visibility > minVisibility && 
                               landmarks.rightShoulder?.visibility > minVisibility;

    if (!hasGoodVisibility && this.previousLandmarks) {
      landmarks = this.previousLandmarks;
    }

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

    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );

    if (clothingType === 'shirt' || clothingType === 't-shirt') {
      const width = Math.abs(rightShoulder.x - leftShoulder.x) * 1.2;
      const height = Math.abs((leftHip.y + rightHip.y) / 2 - neck.y) * 1.1;

      return {
        x: torsoCenter.x,
        y: (neck.y + ((leftHip.y + rightHip.y) / 2)) / 2,
        width,
        height,
        rotation: (shoulderAngle * 180) / Math.PI,
        scale: 1,
        confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2
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
        rotation: (shoulderAngle * 180) / Math.PI,
        scale: 1,
        confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2
      };
    }

    if (clothingType === 'jacket' || clothingType === 'coat') {
      const width = Math.abs(rightShoulder.x - leftShoulder.x) * 1.4;
      const height = Math.abs((leftHip.y + rightHip.y) / 2 - neck.y) * 1.2;

      return {
        x: torsoCenter.x,
        y: (neck.y + ((leftHip.y + rightHip.y) / 2)) / 2,
        width,
        height,
        rotation: (shoulderAngle * 180) / Math.PI,
        scale: 1,
        confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2
      };
    }

    return this.calculateDefaultPosition(landmarks);
  }

  calculateNecklacePosition(landmarks) {
    const { neck, leftShoulder, rightShoulder } = landmarks;

    const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);
    const width = shoulderDistance * 0.7;
    const height = width * 0.3;

    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );

    return {
      x: neck.x,
      y: neck.y + height * 0.8,
      width,
      height,
      rotation: (shoulderAngle * 180) / Math.PI,
      scale: 1,
      confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2
    };
  }

  calculateScarfPosition(landmarks) {
    const { neck, leftShoulder, rightShoulder } = landmarks;

    const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);
    const width = shoulderDistance * 0.9;
    const height = width * 0.6;

    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );

    return {
      x: neck.x,
      y: neck.y + height * 0.3,
      width,
      height,
      rotation: (shoulderAngle * 180) / Math.PI,
      scale: 1,
      confidence: (leftShoulder.visibility + rightShoulder.visibility) / 2
    };
  }

  calculateAccessoryPosition(landmarks, accessoryType) {
    if (accessoryType === 'necklace' || accessoryType === 'jewelry') {
      return this.calculateNecklacePosition(landmarks);
    }

    return this.calculateDefaultPosition(landmarks);
  }

  calculateDefaultPosition(landmarks) {
    const { torsoCenter, bodyWidth, bodyHeight, leftShoulder, rightShoulder } = landmarks;

    return {
      x: torsoCenter.x,
      y: torsoCenter.y,
      width: bodyWidth * 0.6,
      height: bodyHeight * 0.4,
      rotation: 0,
      scale: 1,
      confidence: (leftShoulder?.visibility || 1 + rightShoulder?.visibility || 1) / 2
    };
  }

  dispose() {
    this.landmarks = null;
    this.previousLandmarks = null;
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
  }
}
