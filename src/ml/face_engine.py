
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis

# Singleton class to load model once
class FaceModel:
    instance = None

    def __new__(cls):
        if cls.instance is None:
            cls.instance = super(FaceModel, cls).__new__(cls)
            # Use 'buffalo_l' (larger, more accurate) or 'buffalo_s' (smaller, faster)
            # det_size=(640, 640) is default detection size.
            cls.instance.app = FaceAnalysis(name='buffalo_l', root='./models')
            cls.instance.app.prepare(ctx_id=0, det_size=(640, 640))
        return cls.instance

    def get_app(self):
        return self.app

def get_face_embedding(image_bytes):
    """
    Extracts face embedding from image bytes.
    Returns the embedding of the largest face found.
    """
    model = FaceModel().get_app()
    
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return None, "Invalid image"

    faces = model.get(img)
    
    if len(faces) == 0:
        return None, "No face detected"
    
    # Sort by area (largest face first) to handle multiple faces
    # bbox = [x1, y1, x2, y2]
    faces = sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]), reverse=True)
    
    return faces[0].embedding, None

def compare_faces(known_embeddings, target_embedding, threshold=0.4):
    """
    Compares target embedding with a list of known embeddings.
    Returns the name of the most similar match if above threshold.
    """
    max_score = -1
    best_match = "Unknown"

    # Normalize target embedding
    target_norm = target_embedding / np.linalg.norm(target_embedding)

    for name, embeddings in known_embeddings.items():
        for known_emb in embeddings:
            # Cosine Similarity
            known_norm = known_emb / np.linalg.norm(known_emb)
            score = np.dot(target_norm, known_norm)
            
            if score > max_score:
                max_score = score
                best_match = name

    if max_score >= threshold:
        return best_match, float(max_score)
    else:
        return "Unknown", float(max_score)
