import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chest, bone # Import your routers

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

app = FastAPI(title="X-Insight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the endpoints from your router files
app.include_router(chest.router)
app.include_router(bone.router)

@app.get("/")
def root():
    return {"message": "X-Insight Multi-Diagnostic Engine is operational."}