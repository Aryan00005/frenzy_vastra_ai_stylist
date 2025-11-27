import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import io

class VirtualTryOnService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )
        
    async def process_tryon(self, person_bytes, garment_bytes, product_info=None):
        # Convert bytes to images
        person_img = Image.open(io.BytesIO(person_bytes)).convert('RGB')
        garment_img = Image.open(io.BytesIO(garment_bytes)).convert('RGB')
        
        # Convert to numpy arrays
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        # Detect pose landmarks
        results = self.pose.process(person_np)
        
        if results.pose_landmarks:
            # Get key points for clothing placement
            landmarks = results.pose_landmarks.landmark
            
            # Calculate clothing region
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
            
            # Calculate dimensions
            h, w = person_np.shape[:2]
            
            # Define clothing region
            x1 = int(min(left_shoulder.x, right_shoulder.x) * w) - 20
            x2 = int(max(left_shoulder.x, right_shoulder.x) * w) + 20
            y1 = int(min(left_shoulder.y, right_shoulder.y) * h)
            y2 = int(max(left_hip.y, right_hip.y) * h)
            
            # Resize garment to fit
            garment_resized = cv2.resize(garment_np, (x2-x1, y2-y1))
            
            # Create mask for blending
            mask = np.ones((y2-y1, x2-x1, 3), dtype=np.float32) * 0.7
            
            # Blend garment onto person
            result = person_np.copy()
            if x1 >= 0 and y1 >= 0 and x2 <= w and y2 <= h:
                roi = result[y1:y2, x1:x2]
                blended = roi * (1 - mask) + garment_resized * mask
                result[y1:y2, x1:x2] = blended.astype(np.uint8)
            
            return Image.fromarray(result)
        
        # Fallback: simple overlay
        return self._simple_overlay(person_img, garment_img)
    
    def _simple_overlay(self, person_img, garment_img):
        # Simple center overlay as fallback
        person_np = np.array(person_img)
        garment_np = np.array(garment_img)
        
        h, w = person_np.shape[:2]
        garment_resized = cv2.resize(garment_np, (w//3, h//2))
        
        # Center position
        y_offset = h//4
        x_offset = w//3
        
        # Overlay
        result = person_np.copy()
        gh, gw = garment_resized.shape[:2]
        
        if y_offset + gh <= h and x_offset + gw <= w:
            roi = result[y_offset:y_offset+gh, x_offset:x_offset+gw]
            blended = roi * 0.3 + garment_resized * 0.7
            result[y_offset:y_offset+gh, x_offset:x_offset+gw] = blended
        
        return Image.fromarray(result)