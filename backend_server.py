import json
import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

def run_scraper():
    print("Running background scraper (main.py)...")
    try:
        # Run the main.py script as a separate process to avoid blocking FastAPI's event loop
        subprocess.run(["python", "main.py"], check=True)
        print("Background scraper finished successfully.")
    except Exception as e:
        print(f"Background scraper failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize scheduler on startup
    scheduler = BackgroundScheduler()
    # Scrape every 4 hours. You can change this to minutes=15 or hours=1 for testing
    scheduler.add_job(run_scraper, 'interval', hours=4)
    scheduler.start()
    
    # Optional: You can uncomment the line below to scrape immediately on server startup,
    # but the server will be blocked by the scraper initially. It's usually better to let
    # the client serve the last known json first.
    # run_scraper() 
    
    yield
    
    # Shutdown scheduler
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# Allow React frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/apartments")
async def get_apartments():
    filepath = "backend/all_apartments.json"
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"status": "success", "data": data}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    else:
        return {"status": "error", "message": "all_apartments.json not found. The scraper might still be running."}

if __name__ == "__main__":
    import uvicorn
    # Make sure to run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
