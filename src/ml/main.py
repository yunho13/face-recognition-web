from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import numpy as np
import uvicorn
import io
import cv2

# Import custom face engine
from face_engine import FaceModel, get_face_embedding, compare_faces

app = FastAPI(title="Face Recognition Dashboard API")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for simplicity (Replace with DB later)
# Structure: { "Name": [embedding_vector1, embedding_vector2, ...] }
face_database: Dict[str, List[np.ndarray]] = {}

@app.on_event("startup")
async def startup_event():
    # Pre-load the model on startup to avoid delay on first request
    print("Loading Face Analysis Model...")
    FaceModel()
    print("Model Loaded Successfully.")

@app.post("/register")
async def register_face(
    name: str = Form(...), 
    files: List[UploadFile] = File(...)
):
    """
    Register a new person with one or more images.
    Supports Korean names (UTF-8 handled by FastAPI automatically).
    """
    if name not in face_database:
        face_database[name] = []
    
    success_count = 0
    errors = []

    for file in files:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            errors.append(f"{file.filename}: Invalid image format")
            continue
            
        # Get face analysis result
        # We need the full face object to get the embedding working correctly
        app_instance = FaceModel().app
        faces = app_instance.get(img)

        if len(faces) == 0:
            errors.append(f"{file.filename}: No face detected")
            continue
        
        # Pick the largest face if multiple detected
        faces = sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]), reverse=True)
        face_embedding = faces[0].embedding
        
        face_database[name].append(face_embedding)
        success_count += 1
    
    return {
        "message": f"Successfully registered {success_count} images for '{name}'",
        "errors": errors,
        "total_images": len(face_database[name])
    }

@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...)):
    """
    Recognize a face from an uploaded image.
    Returns the name of the most similar person and the similarity score.
    """
    content = await file.read()
    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format")

    app_instance = FaceModel().app
    faces = app_instance.get(img)

    if len(faces) == 0:
        return {"result": "No face detected", "score": 0.0}
    
    # Process all detected faces
    results = []
    for face in faces:
        # Initial 'Unknown' result
        best_match = "Unknown"
        max_score = 0.0
        
        # Compare with database
        # Manual cosine similarity search (can be optimized with Faiss later)
        target_emb = face.embedding
        target_norm = np.linalg.norm(target_emb)
        
        for name, saved_embeddings in face_database.items():
            for saved_emb in saved_embeddings:
                saved_norm = np.linalg.norm(saved_emb)
                score = np.dot(target_emb, saved_emb) / (target_norm * saved_norm)
                
                if score > max_score:
                    max_score = float(score)
                    if score > 0.4:  # Threshold
                        best_match = name
        
        results.append({
            "box": face.bbox.astype(int).tolist(),
            "name": best_match,
            "score": max_score
        })

    return {"faces": results}

@app.get("/users")
async def list_users():
    """List all registered users and their image counts."""
    return {
        "users": [
            {"name": name, "image_count": len(embeddings)}
            for name, embeddings in face_database.items()
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
