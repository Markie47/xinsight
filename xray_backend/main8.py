import os
from dotenv import load_dotenv

load_dotenv()

import io
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# 🟢 REMOVED: from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
# It is already inside the model!

from routers import chest, bone 

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

app = FastAPI(title="X-Insight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. MODEL LOADING ---
MODEL_PATH = 'models/gatekeeper_model_v2.keras'
gatekeeper_model = None

print(f"⚙️ Initializing Gatekeeper...")

try:
    if os.path.exists(MODEL_PATH):
        gatekeeper_model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Gatekeeper Active.")
    else:
        print(f"❌ ERROR: {MODEL_PATH} not found.")
except Exception as e:
    print(f"❌ Load Error: {e}")

app.include_router(chest.router)
app.include_router(bone.router)

@app.post("/smart-predict")
async def smart_predict(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    if gatekeeper_model is None:
        raise HTTPException(status_code=500, detail="Gatekeeper Model is offline.")

    contents = await file.read()
    
    try:
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        img_resized = image.resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
        img_array = np.expand_dims(img_array, axis=0)
        
        # 🟢 THE FIX: Pass the raw image array directly. 
        # The model will do its own preprocessing automatically.
        prediction_raw = gatekeeper_model.predict(img_array, verbose=0)
        prediction = float(prediction_raw[0][0])
        
        # 🟢 REVERT TO NORMAL LOGIC: Bone is 0, Chest is 1
        detected_type = "chest" if prediction >= 0.5 else "bone"
        
        print(f"--- GATEKEEPER ROUTING ---")
        print(f"Raw Prediction Value: {prediction:.6f}")
        print(f"Routed to: {detected_type.upper()}")
        print(f"--------------------------")

        await file.seek(0)

        # Route to the engine
        if detected_type == "chest":
            result = await chest.predict_chest(file) 
        else:
            result = await bone.predict_bone(file)

        if isinstance(result, dict):
            result["scan_type_detected"] = detected_type
            result["routing_score"] = prediction
            
        return result

    except Exception as e:
        print(f"❌ Processing Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal processing error: {str(e)}")