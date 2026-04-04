import io
import base64
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# Debugging print statement to confirm this file is running
print("--- SERVER IS RUNNING THE LATEST VERSION OF THE CODE (v3 - Binary Fix) ---")

# 1. Initialize the FastAPI App and Configure CORS
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # The default React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Load Your Keras Model
try:
    MODEL = tf.keras.models.load_model('mdlz.keras')
    
    # --- UPDATED FOR BINARY CLASSIFICATION ---
    # This list must match the two classes your model was trained on.
    # The first label is for a low score (e.g., < 0.5), typically the "normal" or "negative" case.
    # The second label is for a high score (e.g., >= 0.5), typically the "abnormal" or "positive" case.
    CLASS_LABELS = ['Normal', 'Abnormal']
    # ------------------------------------------

    print("✅ Model loaded successfully.")
except Exception as e:
    MODEL = None
    print(f"❌ Error loading model: {e}")


# 3. Define Helper Functions

def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """
    Takes image bytes, preprocesses them, and returns a batch-ready
    tensor for the model and the original image for the heatmap.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized) / 255.0
    return np.expand_dims(img_array, axis=0), np.array(img_resized)

def generate_grad_cam_heatmap(processed_image, original_image, model):
    """
    Generates a Grad-CAM heatmap and overlays it on the original image.
    NOTE: The 'last_conv_layer_name' might need to be changed based on your
    model architecture. Use `model.summary()` in your notebook to find it.
    """
    last_conv_layer_name = "top_conv" # Common for EfficientNet
    grad_model = tf.keras.models.Model(
        model.inputs, [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(processed_image)
        # For binary models, the output is often just the prediction itself
        class_channel = preds[0]

    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = last_conv_layer_output[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap).numpy()
    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)

    # Resize and apply colormap
    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

    # Superimpose heatmap
    superimposed_img = cv2.addWeighted(original_image, 0.6, heatmap_colored, 0.4, 0)

    # Encode final image to Base64 string
    _, buffer = cv2.imencode('.jpg', superimposed_img)
    heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{heatmap_base64}"


# 4. Create the Prediction API Endpoint
# --- THIS ENTIRE FUNCTION IS REPLACED ---
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not MODEL:
        return {"error": "Model not loaded or failed to load."}

    # Read and preprocess the uploaded image
    image_bytes = await file.read()
    processed_image, original_image = preprocess_image(image_bytes)

    # Get model's single prediction score (a value between 0 and 1)
    prediction_score = MODEL.predict(processed_image)[0][0]
    
    # --- NEW BINARY CLASSIFICATION LOGIC ---
    threshold = 0.5
    
    if prediction_score < threshold:
        prediction_label = CLASS_LABELS[0] # e.g., 'Normal'
        confidence = 1 - prediction_score
    else:
        prediction_label = CLASS_LABELS[1] # e.g., 'Abnormal'
        confidence = prediction_score
    # ----------------------------------------

    # Generate the Grad-CAM heatmap
    heatmap_b64 = generate_grad_cam_heatmap(processed_image, original_image, MODEL)

    # Assemble the final JSON response
    return {
        "prediction": prediction_label,
        "confidence": float(confidence),
        "heatmap_image_base64": heatmap_b64,
    }

@app.get("/")
def root():
    return {"message": "X-Ray Analysis API is running."}