import io
import os
import base64
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import ollama
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

# --- 0. SILENCE SYSTEM LOGS ---
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
load_dotenv()

# --- 1. INITIALIZE FASTAPI ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. GLOBAL CONFIG & AI CLIENTS ---
HF_TOKEN = os.getenv("HF_TOKEN")
biobert_client = InferenceClient(api_key=HF_TOKEN)
BIOBERT_MODEL = "dmis-lab/biobert-v1.1"

KERAS_MODEL = None
CLASS_LABELS = ["Normal", "Abnormal"]

try:
    KERAS_MODEL = tf.keras.models.load_model("resnet_model.keras")
    print("✅ Keras vision model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading Keras model: {e}")

# --- 3. MEDICAL KNOWLEDGE BASE ---
MEDICAL_KNOWLEDGE_BASE = {
    "Pneumonia/Infection": "Evidence of consolidation, air bronchograms, or patchy opacities suggestive of infectious process.",
    "Pleural Effusion": "Blunting of costophrenic angles or fluid accumulation in the pleural space.",
    "Cardiomegaly": "Enlarged cardiac silhouette with cardiothoracic ratio greater than 0.5.",
    "Pneumothorax": "Visible pleural edge with absence of lung markings peripherally, suggestive of lung collapse.",
    "Nodule/Mass": "Well-defined rounded opacity or focal lesion requiring further oncological correlation.",
    "Normal/Unremarkable": "Lungs are clear, cardiac silhouette is normal, and no acute osseous abnormalities detected."
}

MEDICAL_VECTORS = {}

# --- 4. ROBUST BIOBERT ANALYST LOGIC ---
def get_embedding(text: str):
    """
    Robustly extracts and normalizes BioBERT embeddings to a fixed 768 dimension.
    This solves the 'Incompatible dimension' error by performing Mean Pooling.
    """
    try:
        response = biobert_client.feature_extraction(text, model=BIOBERT_MODEL)
        features = np.array(response)

        # Handle 3D shape [1, tokens, 768]
        if features.ndim == 3:
            return np.mean(features[0], axis=0)
        
        # Handle 2D shape [tokens, 768]
        if features.ndim == 2:
            return np.mean(features, axis=0)
        
        # Fallback for flattened arrays: Reshape back to 768-width and mean
        flat_features = features.flatten()
        if len(flat_features) % 768 == 0:
            return np.mean(flat_features.reshape(-1, 768), axis=0)
            
        return flat_features
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

@app.on_event("startup")
async def startup_event():
    print("🧠 Pre-calculating Medical Knowledge Base embeddings...")
    for condition, description in MEDICAL_KNOWLEDGE_BASE.items():
        vec = get_embedding(description)
        if vec is not None:
            MEDICAL_VECTORS[condition] = vec
    print(f"✅ Knowledge Base Ready with {len(MEDICAL_VECTORS)} conditions.")

def get_biobert_validation(prediction: str, confidence: float) -> dict:
    try:
        if not MEDICAL_VECTORS:
            return {"status": "Knowledge base uninitialized", "match_category": "Unknown", "semantic_score": 0.0}

        query_text = f"X-ray finding is {prediction} with {confidence*100:.1f}% confidence."
        query_vec = get_embedding(query_text)
        
        if query_vec is None:
            raise ValueError("Failed to extract features.")

        best_match = "General Observation"
        highest_score = 0.0

        for condition, ref_vec in MEDICAL_VECTORS.items():
            # Standardizing dimensions for cosine similarity math
            similarity = cosine_similarity(query_vec.reshape(1, -1), ref_vec.reshape(1, -1))[0][0]
            if similarity > highest_score:
                highest_score = similarity
                best_match = condition

        if highest_score > 0.70:
            status = f"Validated: {best_match} (Semantic Match: {highest_score:.2f})"
        else:
            status = f"Clinical Correlation Recommended: Low semantic match ({highest_score:.2f})"

        return {
            "status": status,
            "match_category": best_match,
            "semantic_score": float(highest_score)
        }
    except Exception as e:
        print(f"⚠️ BioBERT Logic Error: {e}")
        return {"status": "Clinical Validation Pending", "match_category": "Unknown", "semantic_score": 0.0}

# --- 5. VISION HELPERS ---
def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_final = np.expand_dims(img_array, axis=0)
    
    # Passing as a dict specifically silences the Keras UserWarning
    return {"input_layer_2": img_final}, np.array(img_resized)

def generate_grad_cam_heatmap(processed_image_dict, original_image, model):
    try:
        last_conv_layer_name = "conv5_block3_out" 
        grad_model = tf.keras.models.Model(
            model.inputs, [model.get_layer(last_conv_layer_name).output, model.output]
        )
        with tf.GradientTape() as tape:
            # Note: processed_image_dict contains the 'input_layer_2' key
            last_conv_layer_output, preds = grad_model(processed_image_dict)
            class_channel = preds[0]
        
        grads = tape.gradient(class_channel, last_conv_layer_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        heatmap = last_conv_layer_output[0] @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap).numpy()
        
        # Safe Normalization
        heatmap = np.maximum(heatmap, 0)
        max_val = np.max(heatmap)
        if max_val == 0: max_val = 1e-10
        heatmap = heatmap / max_val
        
        heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        superimposed_img = cv2.addWeighted(original_image, 0.6, heatmap_colored, 0.4, 0)
        
        _, buffer = cv2.imencode(".jpg", superimposed_img)
        heatmap_base64 = base64.b64encode(buffer).decode("utf-8")
        return f"data:image/jpeg;base64,{heatmap_base64}"
    except Exception as e:
        print(f"Heatmap Error: {e}")
        return None

# --- 6. LLM REPORTING ---
def generate_llm_report(prediction: str, confidence: float, validation: dict) -> str:
    """
    Generates a formal medical report using Few-Shot prompting, 
    integrating ResNet predictions and BioBERT semantic validation.
    """
    model_name = 'adrienbrault/nous-hermes2theta-llama3-8b:q4_K_M'
    
    # Extract BioBERT details for the prompt
    bio_status = validation.get('status', 'Clinical Correlation Recommended')
    bio_category = validation.get('match_category', 'General Observation')
    bio_score = validation.get('semantic_score', 0.0)

    messages = [
        {
            "role": "system",
            "content": "You are an expert radiologist AI. Your task is to synthesize provided data into a formal, professional radiology report. Use structured sections (FINDINGS, IMPRESSION) and do not use placeholders.",
        },
        {
            "role": "user",
            "content": f"""
Here is an example of the required formal style:
---
### EXAMPLE INPUT:
- Prediction: Abnormal
- Confidence: 95.0%
- BioBERT Validation: Validated: Pneumonia/Infection (Semantic Match: 0.88)
- Clinical Category: Pneumonia/Infection

### EXAMPLE OUTPUT:
FINDINGS:
The deep learning model analysis identifies an abnormal clinical pattern with a 95.0% confidence level. Semantic analysis via BioBERT correlates these findings with high-risk infectious pathology, specifically suggestive of Pneumonia. The imaging study reveals focal opacification and increased interstitial markings consistent with the identified category. No evidence of pleural effusion or pneumothorax is noted at this time.

IMPRESSION:
Abnormal radiological findings identified with high statistical and semantic confidence. The pattern is highly suggestive of an infectious process (Pneumonia/Infection). Further clinical correlation and follow-up imaging are recommended to monitor treatment response.
---

Now, generate a formal report for the following new case:

### NEW CASE INPUT:
- Prediction: {prediction}
- Confidence: {confidence*100:.1f}%
- BioBERT Validation: {bio_status}
- Clinical Category: {bio_category}
- Semantic Score: {bio_score:.2f}

### NEW CASE REPORT:
"""
        },
    ]

    try:
        print("--- Contacting Ollama with BioBERT validation... ---")
        response = ollama.chat(model=model_name, messages=messages)
        print("--- Ollama report received. ---")
        return response['message']['content']
    except Exception as e:
        print(f"❌ Ollama Error: {e}")
        return f"Error: Could not generate report. [Status: {bio_status}]"

# --- 7. MAIN ENDPOINT ---
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not KERAS_MODEL:
        raise HTTPException(status_code=500, detail="Vision model is not loaded.")

    try:
        image_bytes = await file.read()
        processed_image_dict, original_image = preprocess_image(image_bytes)

        # A. Vision Prediction
        preds = KERAS_MODEL.predict(processed_image_dict)
        prediction_score = preds[0][0]
        prediction_label = CLASS_LABELS[1] if prediction_score >= 0.5 else CLASS_LABELS[0]
        confidence = prediction_score if prediction_score >= 0.5 else 1 - prediction_score

        # B. BioBERT Validation (Fast & Dimension-safe)
        validation_data = get_biobert_validation(prediction_label, confidence)

        # C. Visual Heatmap (Safe normalization)
        heatmap_b64 = generate_grad_cam_heatmap(processed_image_dict, original_image, KERAS_MODEL)
        
        # D. LLM Report
        report_text = generate_llm_report(prediction_label, confidence, validation_data)

        return {
            "prediction": prediction_label,
            "confidence": float(confidence),
            "medical_validation": validation_data,
            "heatmap_image_base64": heatmap_b64,
            "report_text": report_text
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/")
def root():
    return {"message": "X-Insight API operational."}