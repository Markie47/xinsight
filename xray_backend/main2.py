import io
import base64
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# 1. Initialize the FastAPI App and Configure CORS
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Load Your Keras Model
try:
    # Load the specified ResNet model
    MODEL = tf.keras.models.load_model("resnet_model.keras")
    CLASS_LABELS = ["Normal", "Abnormal"]
    print("✅ ResNet model loaded successfully.")
except Exception as e:
    MODEL = None
    print(f"❌ Error loading model: {e}")


# 3. Helper Functions
def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """
    Preprocesses the uploaded image. Standard ResNet models expect
    3-channel RGB images, so we convert grayscale X-rays to RGB.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")  # Force 3-channel
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    return np.expand_dims(img_array, axis=0), np.array(img_resized)


def generate_grad_cam_heatmap(processed_image, original_image, model):
    """
    Generates a Grad-CAM heatmap for model interpretability.
    """
    # NOTE: You MUST find the correct name for the last convolutional layer
    # in your ResNet model by running `model.summary()` in your notebook.
    # 'conv5_block3_out' is common for ResNet50.
    last_conv_layer_name = "conv5_block3_out"
    
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


def generate_report_text(prediction: str, confidence: float) -> str:
    """
    Simulates an LLM call to generate a human-readable report.
    """
    findings = f"The model identified radiological features consistent with an '{prediction.lower()}' finding with a calculated confidence of {confidence*100:.1f}%."
    impression = f"1. The findings are suggestive of an '{prediction.lower()}' state."
    
    if prediction.lower() == 'abnormal':
        impression += "\n2. Further clinical correlation is recommended."
        
    return f"FINDINGS:\n{findings}\n\nIMPRESSION:\n{impression}"


# 4. Prediction Endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not MODEL:
        return JSONResponse(content={"error": "Model not loaded. Please check server logs."}, status_code=500)

    try:
        image_bytes = await file.read()
        processed_image, original_image = preprocess_image(image_bytes)

        prediction_score = MODEL.predict(processed_image)[0][0]
        threshold = 0.5

        if prediction_score < threshold:
            prediction_label = CLASS_LABELS[0]  # Normal
            confidence = 1 - prediction_score
        else:
            prediction_label = CLASS_LABELS[1]  # Abnormal
            confidence = prediction_score

        heatmap_b64 = generate_grad_cam_heatmap(processed_image, original_image, MODEL)
        report_text = generate_report_text(prediction_label, confidence)

        # Assemble and return the final "Level 4" JSON response
        return {
            "prediction": prediction_label,
            "confidence": float(confidence),
            "heatmap_image_base64": heatmap_b64,
            "report_text": report_text
        }

    except Exception as e:
        # Return a detailed error if something goes wrong during prediction
        return JSONResponse(content={"error": f"Prediction failed: {e}"}, status_code=500)


# 5. Root Endpoint
@app.get("/")
def root():
    return {"message": "ResNet X-Ray Analysis API is running."}