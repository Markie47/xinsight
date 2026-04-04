import io
import base64
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import ollama

# 1. Initialize the FastAPI App
app = FastAPI()

# 2. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load the Keras Vision Model
KERAS_MODEL = None
CLASS_LABELS = ["Normal", "Abnormal"]
try:
    KERAS_MODEL = tf.keras.models.load_model("resnet_model.keras")
    print("✅ Keras vision model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading Keras model: {e}")


# 4. Image Processing Helper Functions (Unchanged)
def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    return np.expand_dims(img_array, axis=0), np.array(img_resized)

def generate_grad_cam_heatmap(processed_image, original_image, model):
    last_conv_layer_name = "conv5_block3_out" # Verify for your ResNet
    grad_model = tf.keras.models.Model(
        model.inputs, [model.get_layer(last_conv_layer_name).output, model.output]
    )
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(processed_image)
        class_channel = preds[0]
    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = last_conv_layer_output[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap).numpy()
    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    superimposed_img = cv2.addWeighted(original_image, 0.6, heatmap_colored, 0.4, 0)
    _, buffer = cv2.imencode(".jpg", superimposed_img)
    heatmap_base64 = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{heatmap_base64}"


# 5. NEW Improved LLM Report Generation Function
def generate_llm_report(prediction: str, confidence: float) -> str:
    """
    Generates a medical report by making an API call to the local Ollama service,
    using a detailed few-shot prompt to guide the output format.
    """
    model_name = 'adrienbrault/nous-hermes2theta-llama3-8b:q4_K_M'
    
    messages = [
        {
            "role": "system",
            "content": "You are an expert radiologist AI. Your task is to synthesize the provided data points into a concise, professional radiology report. Directly integrate the data into the FINDINGS and IMPRESSION sections. Do not use placeholders like '[insert...]'.",
        },
        {
            "role": "user",
            "content": f"""
Here is an example of how to perform the task:
---
### EXAMPLE INPUT:
- Prediction: Abnormal
- Confidence: 100.0%

### EXAMPLE OUTPUT:
FINDINGS:
The deep learning model analysis indicates an abnormal finding with a confidence level of 100.0%. The imaging study reveals a 2.5 cm rounded mass in the right upper lobe of the lung with peripheral ground glass opacity and mild surrounding infiltrates. Further evaluation and correlation with clinical history and other imaging studies are recommended to determine the nature and extent of the abnormality.

IMPRESSION:
Based on the deep learning model analysis and imaging findings, an abnormality is identified with a high degree of confidence. Further diagnostic workup, including additional imaging studies and/or biopsy, may be necessary to determine the diagnosis and appropriate management plan.
---

Now, generate a report for the following new case:

### NEW CASE INPUT:
- Prediction: {prediction}
- Confidence: {confidence*100:.1f}%

### NEW CASE REPORT:
"""
        },
    ]

    try:
        print("--- Contacting Ollama service with improved prompt... ---")
        response = ollama.chat(model=model_name, messages=messages)
        print("--- Ollama report received. ---")
        return response['message']['content']
    except Exception as e:
        print(f"❌ Could not connect to Ollama service: {e}")
        return "Error: Could not generate report. Ensure the Ollama service is running."


# 6. Main Prediction Endpoint (Unchanged)
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not KERAS_MODEL:
        raise HTTPException(status_code=500, detail="Vision model is not loaded.")

    try:
        image_bytes = await file.read()
        processed_image, original_image = preprocess_image(image_bytes)

        prediction_score = KERAS_MODEL.predict(processed_image)[0][0]
        threshold = 0.5

        if prediction_score < threshold:
            prediction_label = CLASS_LABELS[0]
            confidence = 1 - prediction_score
        else:
            prediction_label = CLASS_LABELS[1]
            confidence = prediction_score

        heatmap_b64 = generate_grad_cam_heatmap(processed_image, original_image, KERAS_MODEL)
        
        report_text = generate_llm_report(prediction_label, confidence)

        return {
            "prediction": prediction_label,
            "confidence": float(confidence),
            "heatmap_image_base64": heatmap_b64,
            "report_text": report_text
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# 7. Root Endpoint (Unchanged)
@app.get("/")
def root():
    return {"message": "X-Ray Analysis API with Ollama is running."}