import io
import base64
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# 1. Initialize the Flask App and Configure CORS
app = Flask(__name__)
# CORS is crucial for allowing a future React frontend to connect.
CORS(app)


# 2. Load Your Keras Model
# This logic is identical to the FastAPI version.
try:
    # Use the final, verified model file
    MODEL = tf.keras.models.load_model('mdlz.keras') 
    
    # This list must match your binary model's output
    CLASS_LABELS = ['Normal', 'Abnormal']
    print("✅ Model loaded successfully.")
except Exception as e:
    MODEL = None
    print(f"❌ Error loading model: {e}")


# 3. Define Helper Functions
# These functions are identical to the FastAPI version.

def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """Preprocesses the image for the model."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized) / 255.0
    return np.expand_dims(img_array, axis=0), np.array(img_resized)

def generate_grad_cam_heatmap(processed_image, original_image, model):
    """Generates a Grad-CAM heatmap."""
    last_conv_layer_name = "top_conv"
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
    _, buffer = cv2.imencode('.jpg', superimposed_img)
    heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{heatmap_base64}"


# 4. Create the Prediction API Endpoint
@app.route("/predict", methods=["POST"])
def predict():
    if not MODEL:
        return jsonify({"error": "Model not loaded or failed to load."}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400

    if file:
        image_bytes = file.read()
        processed_image, original_image = preprocess_image(image_bytes)
        
        prediction_score = MODEL.predict(processed_image)[0][0]
        
        threshold = 0.5
        if prediction_score < threshold:
            prediction_label = CLASS_LABELS[0]
            confidence = 1 - prediction_score
        else:
            prediction_label = CLASS_LABELS[1]
            confidence = prediction_score
            
        heatmap_b64 = generate_grad_cam_heatmap(processed_image, original_image, MODEL)
        
        return jsonify({
            "prediction": prediction_label,
            "confidence": float(confidence),
            "heatmap_image_base64": heatmap_b64,
        })

@app.route("/")
def root():
    return "X-Ray Analysis API with Flask is running."


# 5. Run the App
if __name__ == "__main__":
    app.run(debug=True, port=5000)