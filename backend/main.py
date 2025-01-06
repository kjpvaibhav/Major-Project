import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import assemblyai as aai
from assemblyai import Transcriber
from groq import Groq
from api import grog_api
from api import api_speech, MONGO_URI, DB_NAME, COLLECTION_NAME
import os
import shutil
import uuid
from typing import Any, List
from pydantic import BaseModel
from pydub import AudioSegment
from pymongo import MongoClient

import heapq
import math

class Map:
    def __init__(self, maps):
        self.maps = maps
        self.num_floors = len(maps)
        self.floor_size = len(maps[0])
        self.stairs = {}
        self.room_names = {}

    def add_stairs(self, start_floor, start_x, start_y, end_floor, end_x, end_y):
        if end_floor < 0 or end_floor >= self.num_floors or start_floor < 0 or start_floor >= self.num_floors:
            raise ValueError("Invalid floor number")
        if self.maps[end_floor] is None or self.maps[start_floor] is None:
            raise ValueError("Floor not initialized")
        self.stairs[(start_floor, start_x, start_y)] = (end_floor, end_x, end_y)
        self.stairs[(end_floor, end_x, end_y)] = (start_floor, start_x, start_y)
        self.maps[start_floor][start_x][start_y] = 'S'
        self.maps[end_floor][end_x][end_y] = 'S'

    def print_map(self):
        result = []
        for floor in range(self.num_floors):
            floor_result = []
            for i, row in enumerate(self.maps[floor]):
                row_result = []
                for j, cell in enumerate(row):
                    if cell == 'R':
                        room_name = self.room_names.get((floor, i, j), "")
                        row_result.append(room_name)
                    else:
                        row_result.append(cell)
                floor_result.append(row_result)
            result.append(floor_result)
        return result

    def find_route(self, start_floor, start_x, start_y, end_floor, end_x, end_y):
        def heuristic_cost_estimate(current, goal):
            return abs(current[1] - goal[1]) + abs(current[2] - goal[2]) + abs(current[0] - goal[0]) * 5  # Manhattan distance with vertical movement

        def reconstruct_path(came_from, current):
            total_path = [current]
            while current in came_from:
                current = came_from[current]
                total_path.append(current)
            return total_path[::-1]

        start = (start_floor, start_x, start_y)
        goal = (end_floor, end_x, end_y)

        open_set = []
        closed_set = set()
        heapq.heappush(open_set, (0, start))
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic_cost_estimate(start, goal)}

        while open_set:
            _, current = heapq.heappop(open_set)
            closed_set.add(current)
            if current == goal:
                return reconstruct_path(came_from, current)

            floor, x, y = current
            for dx, dy in [(1, 0), (-1, 0), (0, -1), (0, 1)]:
                new_x, new_y = x + dx, y + dy
                if 0 <= new_x < self.floor_size and 0 <= new_y < self.floor_size:
                    if self.maps[floor][new_x][new_y] != 'X':
                        neighbor = (floor, new_x, new_y)
                        tentative_g_score = g_score[current] + 1
                        if tentative_g_score < g_score.get(neighbor, math.inf):
                            came_from[neighbor] = current
                            g_score[neighbor] = tentative_g_score
                            f_score[neighbor] = tentative_g_score + heuristic_cost_estimate(neighbor, goal)
                            heapq.heappush(open_set, (f_score[neighbor], neighbor))

            if current in self.stairs:
                dest_floor, dest_x, dest_y = self.stairs[current]
                neighbor = (dest_floor, dest_x, dest_y)
                tentative_g_score = g_score[current] + 1
                if tentative_g_score < g_score.get(neighbor, math.inf):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + heuristic_cost_estimate(neighbor, goal)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return None

    def get_room_coordinates(self, room_name):
        for floor, floor_map in enumerate(self.maps):
            for x, row in enumerate(floor_map):
                for y, cell in enumerate(row):
                    if cell == room_name:
                        return floor, x, y
        return None

# Initialize the map object with the provided map
provided_map = [
    [['X', 'BEE', 'X', 'Lab2', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', '.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', 'Lab1', '.', 'ADE1', 'X', 'CSE2', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'X', 'X', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'TS1', 'X', '.', 'X', 'CSE4', 'X', 'X'],
     ['X', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
     ['.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'S', 'X', 'X', 'S', 'X', '.', 'X', 'X'],
     ['X', 'X', '.', 'X', '.', '.', '.', '.', '.', '.', '.'],
     ['EC', 'X', '.', 'X', 'X', 'HOD', 'X', 'X', 'CSE3', 'X', 'X'],
     ['.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X']],

    [['X', 'AIML', 'X', 'Lab3', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', '.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', 'Project', '.', 'Lab4', 'X', 'CSM2', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'X', 'X', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'TS2', 'X', '.', 'X', 'S1', 'X', 'X'],
     ['X', 'X', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
     ['X', 'X', '.', 'X', 'X', 'X', 'X', 'X', '.', 'X', 'X'],
     ['X', 'X', '.', 'S', 'X', 'X', 'S', 'X', '.', 'X', 'X'],
     ['X', 'X', '.', 'X', '.', '.', '.', '.', '.', '.', '.'],
     ['PSS', 'X', '.', 'X', 'X', 'X', 'X', 'X', 'S2', 'X', 'X'],
     ['.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X']],

    [['X', 'Lab5', 'X', 'Lab6', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', '.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
     ['X', 'DBMS', '.', 'ALCS', 'X', 'CSE1', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'X', 'X', '.', 'X', 'X', 'X', 'X'],
     ['X', 'X', '.', 'X', 'TS3', 'X', '.', 'X', 'S3', 'X', 'X'],
     ['X', 'X', '.', '.', '.', '.', '.', '.', '.', '.', 'X'],
     ['X', 'X', '.', 'X', 'X', 'X', 'X', 'X', '.', 'X', 'X'],
     ['X', 'X', '.', 'S', 'X', 'X', 'S', 'X', '.', 'X', 'X'],
     ['X', 'X', '.', 'X', '.', '.', '.', '.', '.', '.', '.'],
     ['AP', 'X', '.', 'X', 'X', 'X', 'X', 'X', 'S4', 'X', 'X'],
     ['.', '.', '.', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X']],
]
map_obj = Map(provided_map)

# Add stairs
map_obj.add_stairs(0, 7, 3, 1, 7, 3)
map_obj.add_stairs(0, 7, 6, 1, 7, 6)
map_obj.add_stairs(1, 7, 3, 2, 7, 3)
map_obj.add_stairs(1, 7, 6, 2, 7, 6)

class RoomRequest(BaseModel):
    room_name: str

class RouteRequest(BaseModel):
    start_room: str
    end_room: str


client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

app = FastAPI()

aai.settings.api_key = api_speech
'''
# CORS setup to allow requests from your frontend
origins = [
    "http://localhost:3000/"  # React app origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

'''
# Configure CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def store_question_answer(question, answer):
    try:
        # Insert question-answer pair into MongoDB collection
        collection.insert_one({"question": question, "answer": answer})
        print("Question-answer pair inserted into MongoDB successfully.")
    except Exception as e:
        print(f"Error storing question-answer pair in MongoDB: {e}")

def retrieve_from_mongodb() -> List[dict]:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    documents = list(collection.find({}, {"_id": 0}))
    client.close()
    return documents

class TextRequest(BaseModel):
    text: str

@app.post("/upload/")
async def upload_file(audio_file: UploadFile = File(...)):
    try:

        filename = str(uuid.uuid4()) + ".wav"
        file_path = os.path.join("uploads", filename)
        with open(file_path, "wb") as file_object:
            shutil.copyfileobj(audio_file.file, file_object)
        if os.path.getsize(file_path) == 0:
            raise ValueError("Uploaded audio file is empty")
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(file_path)
        if not transcript.text:
            raise ValueError("Transcript text is null or empty")
        transcript_text1 = transcript.text
        transcript_text = transcript_text1 + "make it sound like a conversation."
        client = Groq(api_key=grog_api)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": transcript_text,
                }
            ],
            model="llama3-70b-8192",
        )
        generated_text = chat_completion.choices[0].message.content
        collection.insert_one({"transcript": transcript_text, "generated_text": generated_text})
        print("audio")
        return {"transcript": transcript_text1, "generated_text": generated_text}
    except Exception as e:
        error_message = f"Internal server error: {str(e)}"
        print(error_message)
        traceback.print_exc()  
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/send-text")
async def send_text(text_request: TextRequest):
    transcript_text = text_request.text
    client = Groq(api_key=grog_api)
    chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant",
                },
                {
                    "role": "user",
                    "content": transcript_text,
                }
            ],
            model="llama3-70b-8192",
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stop=None,
            stream=True,
        )
    generated_text = chat_completion.choices[0].message.content
    collection.insert_one({"transcript": transcript_text, "generated_text": generated_text})
    print(" text ")
    return {"transcript": transcript_text, "generated_text": generated_text}

@app.get("/retrieve-data", response_class=JSONResponse)
async def retrieve_data() -> List[dict]:
    try:
        data = retrieve_from_mongodb()
        return data
    except Exception as e:
        error_message = f"Internal server error: {str(e)}"
        print(error_message)
        traceback.print_exc()  
        raise HTTPException(status_code=500, detail=error_message)






@app.post("/get_room_coordinates")
def get_room_coordinates(request: RoomRequest):
    coords = map_obj.get_room_coordinates(request.room_name)
    if coords is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"floor": coords[0], "x": coords[1], "y": coords[2]}

@app.post("/find_route")
def find_route(request: RouteRequest):
    start_coords = map_obj.get_room_coordinates(request.start_room)
    end_coords = map_obj.get_room_coordinates(request.end_room)

    if start_coords is None:
        raise HTTPException(status_code=404, detail="Start room not found")
    if end_coords is None:
        raise HTTPException(status_code=404, detail="End room not found")

    start_floor, start_x, start_y = start_coords
    end_floor, end_x, end_y = end_coords

    route = map_obj.find_route(start_floor, start_x, start_y, end_floor, end_x, end_y)
    if route is None:
        return {"route": []}

    return {"route": route}

@app.get("/print_map")
def print_map():
    return map_obj.print_map()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=3000)
    