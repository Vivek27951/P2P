from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from decouple import config

# Database configuration
MONGO_URL = config('MONGO_URL', default='mongodb://localhost:27017/p2p_marketplace')
DATABASE_NAME = "p2p_marketplace"

# Async MongoDB client for FastAPI
client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]

# Collections
users_collection = database.users
items_collection = database.items
bookings_collection = database.bookings
reviews_collection = database.reviews
messages_collection = database.messages
payments_collection = database.payments

# Sync client for startup operations
sync_client = MongoClient(MONGO_URL)
sync_database = sync_client[DATABASE_NAME]

async def create_indexes():
    """Create database indexes for better performance"""
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("username", unique=True)
    await items_collection.create_index([("location.coordinates", "2dsphere")])
    await items_collection.create_index("category")
    await items_collection.create_index("owner_id")
    await bookings_collection.create_index("item_id")
    await bookings_collection.create_index("renter_id")
    await messages_collection.create_index([("sender_id", 1), ("receiver_id", 1)])
    await reviews_collection.create_index("item_id")
    await reviews_collection.create_index("reviewer_id")