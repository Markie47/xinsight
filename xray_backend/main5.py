import io
import os
import base64
import cv2
import numpy as np
import tensorflow as tf
import tensorflow.keras.backend as K
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import ollama
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

# --- 0. SILENCE SYSTEM LOGS & CONFIG ---
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. GLOBAL VARIABLES & CONSTANTS ---
HF_TOKEN = os.getenv("HF_TOKEN")
biobert_client = InferenceClient(api_key=HF_TOKEN)
BIOBERT_MODEL = "dmis-lab/biobert-v1.1"

ALL_CLASSES = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion', 
    'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'No Finding', 
    'Nodule', 'Pleural_Thickening', 'Pneumonia', 'Pneumothorax'
]

OPTIMAL_THRESHOLDS = {
    'Atelectasis': np.float32(0.2650123), 'Cardiomegaly': np.float32(0.21395917), 
    'Consolidation': np.float32(0.2007266), 'Edema': np.float32(0.21212262), 
    'Effusion': np.float32(0.26717928), 'Emphysema': np.float32(0.23465158), 
    'Fibrosis': np.float32(0.16066095), 'Hernia': np.float32(0.22812304), 
    'Infiltration': np.float32(0.26759756), 'Mass': np.float32(0.20654865), 
    'No Finding': np.float32(0.3606834), 'Nodule': np.float32(0.21285455), 
    'Pleural_Thickening': np.float32(0.21341527), 'Pneumonia': np.float32(0.19276722), 
    'Pneumothorax': np.float32(0.2455083)
}

# --- 2. CUSTOM LOSS & MODEL LOADING ---
def binary_focal_loss(gamma=2.0, alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        y_pred = K.clip(y_pred, K.epsilon(), 1.0 - K.epsilon())
        y_true = tf.cast(y_true, tf.float32)
        cross_entropy = -y_true * K.log(y_pred) - (1 - y_true) * K.log(1 - y_pred)
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        alpha_factor = y_true * alpha + (1 - y_true) * (1 - alpha)
        modulating_factor = K.pow((1.0 - p_t), gamma)
        loss = alpha_factor * modulating_factor * cross_entropy
        return K.mean(loss, axis=-1)
    return focal_loss_fixed

KERAS_MODEL = None
try:
    KERAS_MODEL = tf.keras.models.load_model(
        "DenseNet121_Fully_Trained.keras", 
        custom_objects={'focal_loss_fixed': binary_focal_loss(gamma=2.0, alpha=0.25)}
    )
    print("✅ DenseNet121 vision model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading Keras model: {e}")

# --- 3. MEDICAL KNOWLEDGE BASE ---
MEDICAL_KNOWLEDGE_BASE = {
    "Pleural Anomalies": "Evidence of effusion, pleural thickening, or pneumothorax indicating pleural space involvement.",
    "Infectious/Inflammatory": "Infiltration, consolidation, or pneumonia suggesting active alveolar filling or infection.",
    "Cardiac Anomalies": "Cardiomegaly indicating enlarged cardiac silhouette.",
    "Chronic/Structural": "Fibrosis, emphysema, atelectasis, or hernia suggesting structural lung damage or volume loss.",
    "Focal Lesions": "Nodule or mass requiring oncological correlation.",
    "Normal": "No pathological findings, clear lungs and normal cardiac silhouette."
}

MEDICAL_VECTORS = {}

# --- 4. BIOBERT ANALYST LOGIC ---
def get_embedding(text: str):
    try:
        response = biobert_client.feature_extraction(text, model=BIOBERT_MODEL)
        features = np.array(response)
        if features.ndim == 3: return np.mean(features[0], axis=0)
        if features.ndim == 2: return np.mean(features, axis=0)
        flat_features = features.flatten()
        if len(flat_features) % 768 == 0: return np.mean(flat_features.reshape(-1, 768), axis=0)
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

def get_biobert_validation(flagged_conditions_str: str) -> dict:
    try:
        if not MEDICAL_VECTORS:
            return {"status": "Knowledge base uninitialized", "match_category": "Unknown", "semantic_score": 0.0}

        query_text = f"X-ray findings include {flagged_conditions_str}."
        query_vec = get_embedding(query_text)
        if query_vec is None: raise ValueError("Failed to extract features.")

        best_match, highest_score = "General Observation", 0.0
        for condition, ref_vec in MEDICAL_VECTORS.items():
            similarity = cosine_similarity(query_vec.reshape(1, -1), ref_vec.reshape(1, -1))[0][0]
            if similarity > highest_score:
                highest_score = similarity
                best_match = condition

        status = f"Validated: {best_match}" if highest_score > 0.65 else "Clinical Correlation Recommended"
        return {"status": status, "match_category": best_match, "semantic_score": float(highest_score)}
    except Exception as e:
        return {"status": "Clinical Validation Pending", "match_category": "Unknown", "semantic_score": 0.0}

# --- 5. VISION & GRAD-CAM HELPERS ---
def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_final = np.expand_dims(img_array, axis=0)
    return img_final, np.array(img_resized) 



def generate_grad_cam_heatmap(img_array, original_image, model, class_index):
    try:
        last_conv_layer_name = "conv5_block16_concat"
        
        grad_model = tf.keras.models.Model(
            inputs=model.inputs, 
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )
        
        with tf.GradientTape() as tape:
            outputs = grad_model(img_array)
            last_conv_layer_output = outputs[0]
            preds = outputs[1]
            
            # Unpack lists safely if Keras nested them
            if isinstance(preds, list): preds = preds[0]
            if isinstance(last_conv_layer_output, list): last_conv_layer_output = last_conv_layer_output[0]
            
            class_channel = preds[:, class_index]
        
        grads = tape.gradient(class_channel, last_conv_layer_output)
        if isinstance(grads, list): grads = grads[0]
            
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        last_conv_layer_output = last_conv_layer_output[0]
        heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.math.reduce_max(heatmap)
        if max_val == 0: max_val = 1e-10
        heatmap = heatmap / max_val
        heatmap = heatmap.numpy()
        
        heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        superimposed_img = cv2.addWeighted(original_image, 0.6, heatmap_colored, 0.4, 0)
        
        _, buffer = cv2.imencode(".jpg", superimposed_img)
        heatmap_base64 = base64.b64encode(buffer).decode("utf-8")
        return f"data:image/jpeg;base64,{heatmap_base64}"
    except Exception as e:
        print(f"❌ Heatmap Error for index {class_index}: {e}")
        return None

# --- 6. LLM REPORTING ---
def generate_llm_report(flagged_list: list, validation: dict) -> str:
    model_name = 'llama3.2:1b'
    bio_category = validation.get('match_category', 'General Observation')
    
    condition_strings = [f"{item['condition']} ({item['confidence']} confidence)" for item in flagged_list]
    diseases_text = ", ".join(condition_strings) if condition_strings else "No abnormalities detected."

    messages = [
        {"role": "system", "content": "You are an expert radiologist AI. Synthesize the provided multi-label findings into a formal, professional radiology report. Use structured sections (FINDINGS, IMPRESSION). Discuss how the flagged conditions clinically relate to one another."},
        {"role": "user", "content": f"""
Generate a formal radiology report for the following case:

### RADIOLOGICAL FINDINGS:
- Flagged Conditions: {diseases_text}
- BioBERT Semantic Category: {bio_category}

Ensure you mention ALL flagged conditions in the findings section and provide a cohesive diagnostic impression.
You are evaluating a Chest X-Ray (CXR). Do not mention CT scans or MRIs.
"""}
    ]

    try:
        print(f"--- Contacting Ollama to synthesize multi-label report for: {diseases_text} ---")
        response = ollama.chat(model=model_name, messages=messages)
        print("--- Ollama report received. ---")
        return response['message']['content']
    except Exception as e:
        print(f"❌ Ollama Error: {e}")
        return "Error: Could not generate report. Please check Ollama connection."

# --- 7. MAIN ENDPOINT ---
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not KERAS_MODEL:
        raise HTTPException(status_code=500, detail="Vision model is not loaded.")

    try:
        image_bytes = await file.read()
        img_array, original_image = preprocess_image(image_bytes)

        # A. Vision Prediction
        preds = KERAS_MODEL.predict(img_array, verbose=0)[0]
        
        flagged_conditions = []
        heatmaps = {}

        for i, class_name in enumerate(ALL_CLASSES):
            prob = preds[i]
            threshold = OPTIMAL_THRESHOLDS[class_name]
            
            if prob >= threshold:
                flagged_conditions.append({
                    "condition": class_name,
                    "confidence": f"{prob*100:.1f}%",
                    "probability": float(prob)
                })
                # B. Generate Heatmaps
                heatmap_b64 = generate_grad_cam_heatmap(img_array, original_image, KERAS_MODEL, i)
                heatmaps[class_name] = heatmap_b64

        if not flagged_conditions or (len(flagged_conditions) == 1 and flagged_conditions[0]['condition'] == 'No Finding'):
            flagged_conditions = [{"condition": "Normal / No Finding", "confidence": "High", "probability": 1.0}]
            diseases_string = "Normal"
        else:
            flagged_conditions = [c for c in flagged_conditions if c['condition'] != 'No Finding']
            flagged_conditions.sort(key=lambda x: x['probability'], reverse=True)
            diseases_string = ", ".join([c['condition'] for c in flagged_conditions])

        # C. BioBERT Validation
        validation_data = get_biobert_validation(diseases_string)

        # D. Synthesized LLM Report
        report_text = generate_llm_report(flagged_conditions, validation_data)

        # E. Return Complex JSON Payload
        return {
            "patient_status": "Abnormal" if diseases_string != "Normal" else "Normal",
            "flagged_conditions": flagged_conditions,
            "medical_validation": validation_data,
            "heatmaps": heatmaps,
            "report_text": report_text
        }
    except Exception as e:
        print(f"❌ API Error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/")
def root():
    return {"message": "Multi-Label X-Insight API operational."}