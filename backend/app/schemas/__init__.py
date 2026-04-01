from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None


# Train Schemas
class TrainBase(BaseModel):
    train_name: str = Field(..., min_length=1)
    departure_station: str
    arrival_station: str
    departure_time: datetime
    arrival_time: datetime
    price: float = Field(..., gt=0)


class TrainCreate(TrainBase):
    pass


class TrainResponse(TrainBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Train Booking Schemas
class BookingStatus(str, Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"


class TrainPaymentMethod(str, Enum):
    CARD = "card"
    PAYPAL = "paypal"


class HotelPaymentMethod(str, Enum):
    CARD = "card"
    PAYPAL = "paypal"


class PackagePaymentMethod(str, Enum):
    CARD = "card"
    PAYPAL = "paypal"


class TrainBookingBase(BaseModel):
    train_id: int


class TrainBookingCreate(TrainBookingBase):
    pass


class TrainBookingResponse(BaseModel):
    id: int
    user_id: int
    train_id: int
    booking_date: datetime
    status: BookingStatus
    created_at: datetime
    train: Optional[TrainResponse] = None

    class Config:
        from_attributes = True


class TrainAvailabilityResponse(BaseModel):
    train_id: int
    requested_seats: int
    available_seats: int
    can_book: bool


class TrainBookWithPaymentRequest(BaseModel):
    train_id: int
    seats_count: int = Field(default=1, ge=1, le=10)
    payment_method: TrainPaymentMethod
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry: Optional[str] = None
    cvv: Optional[str] = None


class TrainPaymentResponse(BaseModel):
    booking_reference: str
    transaction_id: str
    payment_method: TrainPaymentMethod
    payment_status: str
    amount: float


class TrainBookingWithPaymentResponse(BaseModel):
    booking_id: int
    train_id: int
    user_id: int
    seats_count: int
    amount: float
    status: BookingStatus
    message: str
    payment: TrainPaymentResponse


# Hotel Schemas
class HotelBase(BaseModel):
    name: str = Field(..., min_length=1)
    location: str
    price_per_night: float = Field(..., gt=0)
    rating: Optional[float] = Field(None, ge=0, le=5)
    description: Optional[str] = None


class HotelCreate(HotelBase):
    pass


class HotelResponse(HotelBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Hotel Booking Schemas
class HotelBookingBase(BaseModel):
    hotel_id: int
    check_in: datetime
    check_out: datetime


class HotelBookingCreate(HotelBookingBase):
    pass


class HotelBookingResponse(BaseModel):
    id: int
    user_id: int
    hotel_id: int
    check_in: datetime
    check_out: datetime
    status: BookingStatus
    created_at: datetime
    hotel: Optional[HotelResponse] = None

    class Config:
        from_attributes = True


class HotelAvailabilityResponse(BaseModel):
    hotel_id: int
    requested_rooms: int
    available_rooms: int
    can_book: bool


class HotelBookWithPaymentRequest(BaseModel):
    hotel_id: int
    check_in: datetime
    check_out: datetime
    rooms_count: int = Field(default=1, ge=1, le=10)
    payment_method: HotelPaymentMethod
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry: Optional[str] = None
    cvv: Optional[str] = None


class HotelPaymentResponse(BaseModel):
    booking_reference: str
    transaction_id: str
    payment_method: HotelPaymentMethod
    payment_status: str
    amount: float


class HotelBookingWithPaymentResponse(BaseModel):
    booking_id: int
    hotel_id: int
    user_id: int
    check_in: datetime
    check_out: datetime
    rooms_count: int
    nights: int
    amount: float
    status: BookingStatus
    message: str
    payment: HotelPaymentResponse


# Package Schemas
class PackageBase(BaseModel):
    title: str = Field(..., min_length=1)
    location: str
    duration_days: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    description: Optional[str] = None


class PackageCreate(PackageBase):
    pass


class PackageResponse(PackageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Package Booking Schemas
class PackageBookingBase(BaseModel):
    package_id: int
    start_date: datetime


class PackageBookingCreate(PackageBookingBase):
    pass


class PackageBookingResponse(BaseModel):
    id: int
    user_id: int
    package_id: int
    start_date: datetime
    status: BookingStatus
    created_at: datetime
    package: Optional[PackageResponse] = None

    class Config:
        from_attributes = True


class PackageBookWithPaymentRequest(BaseModel):
    package_id: int
    start_date: datetime
    travelers_count: int = Field(default=1, ge=1, le=20)
    payment_method: PackagePaymentMethod
    card_number: Optional[str] = None
    card_holder: Optional[str] = None
    expiry: Optional[str] = None
    cvv: Optional[str] = None


class PackagePaymentResponse(BaseModel):
    booking_reference: str
    transaction_id: str
    payment_method: PackagePaymentMethod
    payment_status: str
    amount: float


class PackageBookingWithPaymentResponse(BaseModel):
    booking_id: int
    package_id: int
    user_id: int
    start_date: datetime
    travelers_count: int
    amount: float
    status: BookingStatus
    message: str
    payment: PackagePaymentResponse


# Place Schemas
class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1)
    district: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class PlaceCreate(PlaceBase):
    pass


class PlaceResponse(PlaceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetBase(BaseModel):
    trip_name: str = Field(..., min_length=1)
    total_budget: float = Field(..., gt=0)
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    travelers: int = Field(default=1, ge=1)
    currency: str = Field(default="USD", min_length=1, max_length=10)
    flights_transport_amount: float = Field(default=0.0, ge=0)
    flights_transport_notes: Optional[str] = None
    accommodation_amount: float = Field(default=0.0, ge=0)
    accommodation_notes: Optional[str] = None
    food_amount: float = Field(default=0.0, ge=0)
    food_notes: Optional[str] = None
    local_transport_amount: float = Field(default=0.0, ge=0)
    local_transport_notes: Optional[str] = None
    activities_amount: float = Field(default=0.0, ge=0)
    activities_notes: Optional[str] = None
    shopping_amount: float = Field(default=0.0, ge=0)
    shopping_notes: Optional[str] = None
    insurance_amount: float = Field(default=0.0, ge=0)
    insurance_notes: Optional[str] = None
    misc_amount: float = Field(default=0.0, ge=0)
    misc_notes: Optional[str] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    trip_name: Optional[str] = None
    total_budget: Optional[float] = None
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    travelers: Optional[int] = None
    currency: Optional[str] = None
    flights_transport_amount: Optional[float] = None
    flights_transport_notes: Optional[str] = None
    accommodation_amount: Optional[float] = None
    accommodation_notes: Optional[str] = None
    food_amount: Optional[float] = None
    food_notes: Optional[str] = None
    local_transport_amount: Optional[float] = None
    local_transport_notes: Optional[str] = None
    activities_amount: Optional[float] = None
    activities_notes: Optional[str] = None
    shopping_amount: Optional[float] = None
    shopping_notes: Optional[str] = None
    insurance_amount: Optional[float] = None
    insurance_notes: Optional[str] = None
    misc_amount: Optional[float] = None
    misc_notes: Optional[str] = None


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Weather Schemas
class WeatherData(BaseModel):
    city: str
    temperature: float
    feels_like: float
    humidity: int
    pressure: int
    weather_main: str
    weather_description: str
    wind_speed: float


class DistrictForecast(BaseModel):
    district: str
    date: str
    condition: str
    temperature: float
    humidity: int
    wind_speed: float
