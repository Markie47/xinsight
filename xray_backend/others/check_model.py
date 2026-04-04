import tensorflow as tf
import os

# --- Make sure this is the exact name of your model file ---
MODEL_FILENAME = 'mdlz.keras' 
# -----------------------------------------------------------

print(f"--- Attempting to load model: {MODEL_FILENAME} ---")

if not os.path.exists(MODEL_FILENAME):
    print(f"❌ ERROR: The file '{MODEL_FILENAME}' was not found in this directory.")
else:
    try:
        model = tf.keras.models.load_model(MODEL_FILENAME)
        print("\n✅ --- MODEL LOADED SUCCESSFULLY ---")
        print("--- PRINTING MODEL SUMMARY ---")
        model.summary()
    except Exception as e:
        print("\n❌ --- AN ERROR OCCURRED DURING LOADING ---")
        print(f"The error is: {e}")