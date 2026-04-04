import io
import cv2
import numpy as np
import base64
import tensorflow as tf
from PIL import Image

def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """
    Standardizes the incoming image for DenseNet121.
    Converts bytes to a normalized NumPy array and returns both the 
    preprocessed batch and the original image for overlay.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_resized = img.resize(target_size)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_final = np.expand_dims(img_array, axis=0)
    return img_final, np.array(img_resized) 

def generate_grad_cam_heatmap(img_array, original_image, model, class_index):
    """
    Generates a Grad-CAM heatmap and overlays it onto the original X-ray.
    Uses Direct Call inference to avoid Keras 3 input naming conflicts.
    """
    try:
        last_conv_layer_name = "conv5_block16_concat"
        
        # Create a functional model that maps input to the last conv layer and output
        grad_model = tf.keras.models.Model(
            inputs=[model.inputs], 
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )
        
        with tf.GradientTape() as tape:
            # Using Direct Call (grad_model(img_array)) to bypass naming warnings
            last_conv_layer_output, preds = grad_model(img_array, training=False)
            
            # Ensure we handle list outputs from multi-output functional models
            if isinstance(preds, list): 
                preds = preds[0]
            if isinstance(last_conv_layer_output, list): 
                last_conv_layer_output = last_conv_layer_output[0]
                
            class_channel = preds[:, class_index]
        
        # Compute gradients of the class with respect to the last conv layer
        grads = tape.gradient(class_channel, last_conv_layer_output)
        if isinstance(grads, list): 
            grads = grads[0]
            
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        last_conv_layer_output = last_conv_layer_output[0]
        heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Normalize heatmap between 0 and 1
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.math.reduce_max(heatmap)
        if max_val == 0: 
            max_val = 1e-10
        heatmap = heatmap / max_val
        heatmap = heatmap.numpy()
        
        # --- OpenCV Color Processing ---
        # Note: original_image is RGB (from PIL), OpenCV expects BGR for processing
        original_bgr = cv2.cvtColor(original_image, cv2.COLOR_RGB2BGR)
        
        heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
        heatmap_resized = np.uint8(255 * heatmap_resized)
        
        # cv2.COLORMAP_JET produces a BGR heatmap
        heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
        
        # Superimpose BGR heatmap onto BGR original
        superimposed_img = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)
        
        # Encode the final BGR image into a JPEG buffer
        _, buffer = cv2.imencode(".jpg", superimposed_img)
        heatmap_base64 = base64.b64encode(buffer).decode("utf-8")
        
        return f"data:image/jpeg;base64,{heatmap_base64}"
        
    except Exception as e:
        print(f"❌ Heatmap Error for index {class_index}: {e}")
        return None