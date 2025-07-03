from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
from typing import List, Optional
import json
import uuid
from math import radians, cos, sin, asin, sqrt

from backend.database import (
    users_collection, items_collection, bookings_collection, 
    reviews_collection, messages_collection, payments_collection,
    create_indexes
)
from backend.models import (
    UserCreate, UserResponse, UserUpdate, LoginRequest, Token,
    ItemCreate, ItemResponse, ItemUpdate, BookingCreate, BookingResponse, BookingUpdate,
    ReviewCreate, ReviewResponse, MessageCreate, MessageResponse,
    PaymentCreate, PaymentResponse, ItemCategory, BookingStatus
)
from backend.auth import (
    get_password_hash, authenticate_user, create_access_token, 
    get_current_user, get_current_active_user, create_user_id
)

app = FastAPI(title="P2P Marketplace API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager for real-time chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            await self.user_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Startup event
@app.on_event("startup")
async def startup_event():
    await create_indexes()
    print("Database indexes created successfully")

# Utility functions
def haversine(lon1, lat1, lon2, lat2):
    """Calculate the great circle distance between two points on earth (in km)"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    existing_username = await users_collection.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # Create new user
    user_id = create_user_id()
    hashed_password = get_password_hash(user.password)
    
    user_data = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "bio": user.bio,
        "profile_image": user.profile_image,
        "location": user.location.dict() if user.location else None,
        "password": hashed_password,
        "role": "user",
        "rating": 0.0,
        "total_reviews": 0,
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await users_collection.insert_one(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Return token and user data
    user_response = UserResponse(**user_data)
    return Token(access_token=access_token, user=user_response)

@app.post("/api/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**user)
    return Token(access_token=access_token, user=user_response)

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    return UserResponse(**current_user)

@app.put("/api/auth/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        if "location" in update_data:
            update_data["location"] = update_data["location"].dict()
        
        await users_collection.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
        
        updated_user = await users_collection.find_one({"id": current_user["id"]})
        return UserResponse(**updated_user)
    
    return UserResponse(**current_user)

# Item endpoints
@app.post("/api/items", response_model=ItemResponse)
async def create_item(
    item: ItemCreate,
    current_user: dict = Depends(get_current_active_user)
):
    item_id = str(uuid.uuid4())
    item_data = {
        "id": item_id,
        "owner_id": current_user["id"],
        "title": item.title,
        "description": item.description,
        "category": item.category,
        "price_per_day": item.price_per_day,
        "images": item.images,
        "location": item.location.dict(),
        "available_dates": item.available_dates,
        "is_available": True,
        "rating": 0.0,
        "total_reviews": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await items_collection.insert_one(item_data)
    return ItemResponse(**item_data)

@app.get("/api/items", response_model=List[ItemResponse])
async def get_items(
    category: Optional[ItemCategory] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    max_distance: Optional[float] = None,
    limit: int = 20,
    skip: int = 0
):
    query = {"is_available": True}
    
    if category:
        query["category"] = category
    
    items = await items_collection.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    # Filter by distance if location provided
    if lat is not None and lon is not None and max_distance is not None:
        filtered_items = []
        for item in items:
            if item.get("location") and item["location"].get("coordinates"):
                item_lon, item_lat = item["location"]["coordinates"]
                distance = haversine(lon, lat, item_lon, item_lat)
                if distance <= max_distance:
                    filtered_items.append(item)
        items = filtered_items
    
    return [ItemResponse(**item) for item in items]

@app.get("/api/items/my", response_model=List[ItemResponse])
async def get_my_items(
    current_user: dict = Depends(get_current_active_user)
):
    items = await items_collection.find({"owner_id": current_user["id"]}).to_list(length=None)
    return [ItemResponse(**item) for item in items]

@app.get("/api/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str):
    item = await items_collection.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemResponse(**item)

@app.put("/api/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    item_update: ItemUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    item = await items_collection.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
    
    update_data = {k: v for k, v in item_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        if "location" in update_data:
            update_data["location"] = update_data["location"].dict()
        
        await items_collection.update_one(
            {"id": item_id},
            {"$set": update_data}
        )
        
        updated_item = await items_collection.find_one({"id": item_id})
        return ItemResponse(**updated_item)
    
    return ItemResponse(**item)

@app.delete("/api/items/{item_id}")
async def delete_item(
    item_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    item = await items_collection.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    
    await items_collection.delete_one({"id": item_id})
    return {"message": "Item deleted successfully"}

@app.get("/api/items/my", response_model=List[ItemResponse])
async def get_my_items(
    current_user: dict = Depends(get_current_active_user)
):
    items = await items_collection.find({"owner_id": current_user["id"]}).to_list(length=None)
    return [ItemResponse(**item) for item in items]

# Booking endpoints
@app.post("/api/bookings", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_active_user)
):
    # Check if item exists
    item = await items_collection.find_one({"id": booking.item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if user is not the owner
    if item["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot book your own item")
    
    booking_id = str(uuid.uuid4())
    booking_data = {
        "id": booking_id,
        "item_id": booking.item_id,
        "renter_id": current_user["id"],
        "start_date": booking.start_date,
        "end_date": booking.end_date,
        "total_amount": booking.total_amount,
        "message": booking.message,
        "status": BookingStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await bookings_collection.insert_one(booking_data)
    return BookingResponse(**booking_data)

@app.get("/api/bookings", response_model=List[BookingResponse])
async def get_bookings(
    current_user: dict = Depends(get_current_active_user)
):
    bookings = await bookings_collection.find(
        {"$or": [
            {"renter_id": current_user["id"]},
            {"item_id": {"$in": [item["id"] for item in await items_collection.find({"owner_id": current_user["id"]}).to_list(length=None)]}}
        ]}
    ).to_list(length=None)
    return [BookingResponse(**booking) for booking in bookings]

@app.put("/api/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    booking_update: BookingUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    booking = await bookings_collection.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if user is the renter or owner of the item
    item = await items_collection.find_one({"id": booking["item_id"]})
    if booking["renter_id"] != current_user["id"] and item["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    
    update_data = {k: v for k, v in booking_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        await bookings_collection.update_one(
            {"id": booking_id},
            {"$set": update_data}
        )
        
        updated_booking = await bookings_collection.find_one({"id": booking_id})
        return BookingResponse(**updated_booking)
    
    return BookingResponse(**booking)

# Review endpoints
@app.post("/api/reviews", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_active_user)
):
    # Check if item exists
    item = await items_collection.find_one({"id": review.item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if user has completed booking for this item
    booking = await bookings_collection.find_one({
        "item_id": review.item_id,
        "renter_id": current_user["id"],
        "status": BookingStatus.COMPLETED
    })
    if not booking:
        raise HTTPException(status_code=400, detail="You can only review items you have rented")
    
    review_id = str(uuid.uuid4())
    review_data = {
        "id": review_id,
        "item_id": review.item_id,
        "reviewer_id": current_user["id"],
        "booking_id": booking["id"],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow()
    }
    
    await reviews_collection.insert_one(review_data)
    
    # Update item rating
    reviews = await reviews_collection.find({"item_id": review.item_id}).to_list(length=None)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await items_collection.update_one(
        {"id": review.item_id},
        {"$set": {"rating": avg_rating, "total_reviews": len(reviews)}}
    )
    
    return ReviewResponse(**review_data)

@app.get("/api/reviews/{item_id}", response_model=List[ReviewResponse])
async def get_item_reviews(item_id: str):
    reviews = await reviews_collection.find({"item_id": item_id}).to_list(length=None)
    return [ReviewResponse(**review) for review in reviews]

# WebSocket endpoint for real-time chat
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            message_id = str(uuid.uuid4())
            message_db = {
                "id": message_id,
                "sender_id": user_id,
                "receiver_id": message_data["receiver_id"],
                "content": message_data["content"],
                "message_type": "text",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            await messages_collection.insert_one(message_db)
            
            # Send message to receiver
            await manager.send_personal_message(
                json.dumps({
                    "id": message_id,
                    "sender_id": user_id,
                    "receiver_id": message_data["receiver_id"],
                    "content": message_data["content"],
                    "created_at": datetime.utcnow().isoformat()
                }),
                message_data["receiver_id"]
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# Message endpoints
@app.get("/api/messages/{other_user_id}", response_model=List[MessageResponse])
async def get_messages(
    other_user_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    messages = await messages_collection.find({
        "$or": [
            {"sender_id": current_user["id"], "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": current_user["id"]}
        ]
    }).sort("created_at", 1).to_list(length=None)
    
    return [MessageResponse(**message) for message in messages]

@app.put("/api/messages/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    await messages_collection.update_one(
        {"id": message_id, "receiver_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    return {"message": "Message marked as read"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)