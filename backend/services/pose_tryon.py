import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import io

class PoseTryOnService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )
    
    async def realistic_tryon(self, person_bytes, garment_bytes, product_info=None):
        """Realistic virtual try-on using MediaPipe pose detection"""
        try:
            person_img = Image.open(io.BytesIO(person_bytes))
            garment_img = Image.open(io.BytesIO(garment_bytes))
            
            person_np = np.array(person_img)
            garment_np = np.array(garment_img)
            
            # Convert to RGB for MediaPipe
            rgb_image = cv2.cvtColor(person_np, cv2.COLOR_RGB2BGR)
            results = self.pose.process(rgb_image)
            
            h, w = person_np.shape[:2]
            result = person_np.copy()
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # Get body keypoints
                left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
                right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
                left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
                right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
                
                # Calculate clothing region
                x1 = int(min(left_shoulder.x, right_shoulder.x) * w) - 40
                x2 = int(max(left_shoulder.x, right_shoulder.x) * w) + 40
                y1 = int(min(left_shoulder.y, right_shoulder.y) * h) - 20
                y2 = int(max(left_hip.y, right_hip.y) * h) + 60
                
                # Ensure bounds
                x1 = max(0, x1)
                x2 = min(w, x2)
                y1 = max(0, y1)
                y2 = min(h, y2)
                
                clothing_w = x2 - x1
                clothing_h = y2 - y1
                
                if clothing_w > 0 and clothing_h > 0:
                    # Resize garment to fit body
                    garment_fitted = cv2.resize(garment_np, (clothing_w, clothing_h))
                    
                    # Create smooth blend mask
                    mask = np.ones((clothing_h, clothing_w), dtype=np.float32)
                    mask = cv2.GaussianBlur(mask, (31, 31), 0)
                    mask_3d = np.stack([mask] * 3, axis=-1)
                    
                    # Get ROI and calculate lighting
                    roi = result[y1:y2, x1:x2]
                    roi_brightness = np.mean(cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY)) / 255.0
                    
                    # Adjust garment lighting
                    garment_lit = garment_fitted * (roi_brightness * 1.1)
                    garment_lit = np.clip(garment_lit, 0, 255).astype(np.uint8)
                    
                    # Blend with smooth transition
                    blended = roi * (1 - mask_3d * 0.85) + garment_lit * (mask_3d * 0.85)
                    result[y1:y2, x1:x2] = blended.astype(np.uint8)
                    
                    # Add realistic shadow
                    shadow_offset = 3
                    if y2 + shadow_offset < h and x2 + shadow_offset < w:
                        shadow_mask = mask * 0.2
                        shadow_roi = result[y1+shadow_offset:y2+shadow_offset, x1+shadow_offset:x2+shadow_offset]
                        shadow_3d = np.stack([shadow_mask] * 3, axis=-1)
                        shadow_roi = shadow_roi * (1 - shadow_3d)
                        result[y1+shadow_offset:y2+shadow_offset, x1+shadow_offset:x2+shadow_offset] = shadow_roi.astype(np.uint8)
            
            else:
                # Fallback: center overlay
                garment_resized = cv2.resize(garment_np, (w//3, h//2))
                y_offset = h//4
                x_offset = w//3
                
                gh, gw = garment_resized.shape[:2]
                if y_offset + gh <= h and x_offset + gw <= w:
                    roi = result[y_offset:y_offset+gh, x_offset:x_offset+gw]
                    blended = roi * 0.3 + garment_resized * 0.7
                    result[y_offset:y_offset+gh, x_offset:x_offset+gw] = blended
            
            # Add AI indicator
            cv2.rectangle(result, (10, 10), (400, 70), (0, 0, 0), -1)
            cv2.putText(result, '🤖 AI Virtual Try-On - MediaPipe Pose', (15, 35), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(result, 'Real-time body detection & fitting', (15, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            return Image.fromarray(result)
            
        except Exception as e:
            print(f"Pose try-on failed: {e}")
            return await self._simple_overlay(person_bytes, garment_bytes)
    
    async def _simple_overlay(self, person_bytes, garment_bytes):
        """Simple overlay fallback"""
        person_img = Image.open(io.BytesIO(person_bytes))
        garment_img = Image.open(io.BytesIO(garment_bytes))
        
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        h, w = person_np.shape[:2]
        garment_resized = cv2.resize(garment_np, (w//3, h//2))
        
        result = person_np.copy()
        y_offset = h//4
        x_offset = w//3
        
        gh, gw = garment_resized.shape[:2]
        if y_offset + gh <= h and x_offset + gw <= w:
            result[y_offset:y_offset+gh, x_offset:x_offset+gw] = garment_resized
        
        return Image.fromarray(result)