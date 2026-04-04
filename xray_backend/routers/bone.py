import os
import json
import ollama
import numpy as np
import tensorflow as tf
import tensorflow.keras.backend as K
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from sklearn.metrics.pairwise import cosine_similarity
from huggingface_hub import InferenceClient

# Import shared utilities
from utils.visualizer import preprocess_image, generate_grad_cam_heatmap

router = APIRouter(prefix="/bone", tags=["Bone Diagnostics"])

# --- 1. GLOBAL CONFIG & BIOBERT SETUP ---
HF_TOKEN = os.getenv("HF_TOKEN")
biobert_client = InferenceClient(api_key=HF_TOKEN)
BIOBERT_MODEL = "dmis-lab/biobert-v1.1"

BONE_CLASSES = ['Cancer', 'Fracture', 'Osteoarthritis', 'Osteopenia', 'Osteoporosis', 'Scoliosis']

# Skeletal Knowledge Base for Semantic Validation
BONE_KNOWLEDGE_BASE = {
    "Malignancy/Neoplastic": "Evidence of abnormal bone growth, primary bone tumors, or metastatic lesions suggesting cancer.",
    "Traumatic/Structural": "Disruption of cortical continuity or acute breaks indicating a fracture.",
    "Degenerative/Joint": "Reduction in joint space, osteophyte formation, or subchondral sclerosis suggesting osteoarthritis.",
    "Density/Metabolic": "Decreased bone mineral density or porous bone structure indicating osteopenia or osteoporosis.",
    "Deformity/Alignment": "Lateral curvature of the spine or abnormal vertebral alignment suggesting scoliosis.",
    "Normal": "Intact cortical margins, normal bone density, and preserved joint spaces without pathology."
}

BONE_VECTORS = {}

# --- 2. BIOBERT ANALYST FUNCTIONS ---
def get_embedding(text: str):
    """Extracts features from BioBERT via Hugging Face API."""
    try:
        response = biobert_client.feature_extraction(text, model=BIOBERT_MODEL)
        features = np.array(response)
        # Handle different output shapes from the feature extraction pipeline
        if features.ndim == 3: return np.mean(features[0], axis=0)
        if features.ndim == 2: return np.mean(features, axis=0)
        return features.flatten()[:768] # BioBERT base size
    except Exception as e:
        print(f"BioBERT Embedding error: {e}")
        return None

@router.on_event("startup")
async def startup_event():
    """Pre-calculates embeddings for the bone knowledge base at server start."""
    print("🧠 Pre-calculating Skeletal Knowledge Base embeddings...")
    for condition, description in BONE_KNOWLEDGE_BASE.items():
        vec = get_embedding(description)
        if vec is not None:
            BONE_VECTORS[condition] = vec
    print(f"✅ Bone Knowledge Base Ready with {len(BONE_VECTORS)} semantic categories.")

def get_biobert_validation(flagged_conditions_str: str) -> dict:
    """Matches detected findings to a high-level clinical category."""
    try:
        if not BONE_VECTORS:
            return {"status": "Knowledge base uninitialized", "match_category": "Unknown", "semantic_score": 0.0}

        query_text = f"Skeletal X-ray findings include {flagged_conditions_str}."
        query_vec = get_embedding(query_text)
        if query_vec is None: return {"status": "Embedding failed", "match_category": "Unknown", "semantic_score": 0.0}

        best_match, highest_score = "General Observation", 0.0
        for category, ref_vec in BONE_VECTORS.items():
            similarity = cosine_similarity(query_vec.reshape(1, -1), ref_vec.reshape(1, -1))[0][0]
            if similarity > highest_score:
                highest_score = similarity
                best_match = category

        status = f"Validated: {best_match}" if highest_score > 0.65 else "Clinical Correlation Required"
        return {"status": status, "match_category": best_match, "semantic_score": float(highest_score)}
    except Exception as e:
        return {"status": "Validation Error", "match_category": "Unknown", "semantic_score": 0.0}

# --- 3. VISION MODEL UTILS ---
def binary_focal_loss(gamma=2.0, alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        y_pred = K.clip(y_pred, K.epsilon(), 1.0 - K.epsilon())
        y_true = tf.cast(y_true, tf.float32)
        cross_entropy = -y_true * K.log(y_pred) - (1 - y_true) * K.log(1 - y_pred)
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        alpha_factor = y_true * alpha + (1 - y_true) * (1 - alpha)
        modulating_factor = K.pow((1.0 - p_t), gamma)
        return K.mean(alpha_factor * modulating_factor * cross_entropy, axis=-1)
    return focal_loss_fixed

try:
    BONE_MODEL = tf.keras.models.load_model(
        "models/bone_model_best.keras", 
        custom_objects={'focal_loss_fixed': binary_focal_loss()}
    )
    with open("models/bone_thresholds.json", "r") as f:
        BONE_THRESHOLDS = json.load(f)
    print("✅ Bone Vision model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading Bone artifacts: {e}")
    BONE_MODEL = None

# --- 4. LLAMA 3 REPORTING ---
def generate_bone_report(flagged_list: list, validation: dict) -> str:
    bio_category = validation.get('match_category', 'General Observation')
    condition_strings = [f"{item['condition']} ({item['confidence']} confidence)" for item in flagged_list]
    diseases_text = ", ".join(condition_strings) if condition_strings else "Normal skeletal structure."

    prompt = f"""
    You are an expert orthopedic radiologist. Synthesize these findings into a professional report.
    - Pathologies: {diseases_text}
    - Semantic Category: {bio_category}
    
    Structure: [CLINICAL FINDINGS] and [DIAGNOSTIC IMPRESSION]. Focus on structural integrity and density.
    """
    try:
        response = ollama.chat(model='llama3.2:1b', messages=[{"role": "user", "content": prompt}])
        return response['message']['content']
    except Exception as e:
        return f"Report error: {str(e)}"

# --- 5. ENDPOINT ---
@router.post("/predict")
async def predict_bone(file: UploadFile = File(...)):
    if not BONE_MODEL: raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        image_bytes = await file.read()
        img_array, original_image = preprocess_image(image_bytes)

        # 1. Vision Prediction
        preds = BONE_MODEL(img_array, training=False).numpy()[0]
        flagged_conditions, heatmaps = [], {}

        for i, class_name in enumerate(BONE_CLASSES):
            prob = preds[i]
            if prob >= float(BONE_THRESHOLDS[class_name]):
                flagged_conditions.append({"condition": class_name, "confidence": f"{prob*100:.1f}%", "probability": float(prob)})
                heatmaps[class_name] = generate_grad_cam_heatmap(img_array, original_image, BONE_MODEL, i)

        if not flagged_conditions:
            flagged_conditions = [{"condition": "Normal", "confidence": "High", "probability": 1.0}]
            diseases_string = "Normal"
        else:
            flagged_conditions.sort(key=lambda x: x['probability'], reverse=True)
            diseases_string = ", ".join([c['condition'] for c in flagged_conditions])

        # 2. BioBERT Semantic Validation
        validation_data = get_biobert_validation(diseases_string)

        # 3. Llama 3 Report
        report_text = generate_bone_report(flagged_conditions, validation_data)

        return {
            "patient_status": "Abnormal" if diseases_string != "Normal" else "Normal",
            "flagged_conditions": flagged_conditions,
            "medical_validation": validation_data,
            "heatmaps": heatmaps,
            "report_text": report_text
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)