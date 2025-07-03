from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class ItemCategory(str, Enum):
    CLOTHES = "clothes"
    TOOLS = "tools"
    ELECTRONICS = "electronics"
    FURNITURE = "furniture"
    VEHICLES = "vehicles"
    OTHER = "other"

class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# User Models
class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float] = Field(..., description="[longitude, latitude]")
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None  # Base64 encoded image
    location: Optional[Location] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: UserRole = UserRole.USER
    rating: float = 0.0
    total_reviews: int = 0
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    location: Optional[Location] = None

# Item Models
class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: ItemCategory
    price_per_day: float = Field(..., gt=0)
    images: List[str] = Field(default=[], description="Base64 encoded images")
    location: Location
    available_dates: List[str] = Field(default=[], description="Available dates in YYYY-MM-DD format")

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    is_available: bool = True
    rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ItemCategory] = None
    price_per_day: Optional[float] = None
    images: Optional[List[str]] = None
    location: Optional[Location] = None
    available_dates: Optional[List[str]] = None
    is_available: Optional[bool] = None

# Booking Models
class BookingBase(BaseModel):
    item_id: str
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    total_amount: float = Field(..., gt=0)
    message: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    renter_id: str
    status: BookingStatus = BookingStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    message: Optional[str] = None

# Review Models
class ReviewBase(BaseModel):
    item_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reviewer_id: str
    booking_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Message Models
class MessageBase(BaseModel):
    receiver_id: str
    content: str = Field(..., min_length=1, max_length=1000)
    message_type: str = "text"

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Payment Models
class PaymentBase(BaseModel):
    booking_id: str
    amount: float = Field(..., gt=0)
    currency: str = "usd"

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stripe_payment_intent_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str