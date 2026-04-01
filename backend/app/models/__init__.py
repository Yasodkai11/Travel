from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    train_bookings = relationship("TrainBookingModel", back_populates="user")
    train_payments = relationship("TrainPaymentModel", back_populates="user")
    hotel_bookings = relationship("HotelBookingModel", back_populates="user")
    hotel_payments = relationship("HotelPaymentModel", back_populates="user")
    package_bookings = relationship("PackageBookingModel", back_populates="user")
    package_payments = relationship("PackagePaymentModel", back_populates="user")
    budgets = relationship("BudgetModel", back_populates="user")


class TrainModel(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_name = Column(String(255), nullable=False, index=True)
    departure_station = Column(String(255), nullable=False)
    arrival_station = Column(String(255), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("TrainBookingModel", back_populates="train")
    payments = relationship("TrainPaymentModel", back_populates="train")


class BookingStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    CARD = "card"
    PAYPAL = "paypal"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class TrainBookingModel(Base):
    __tablename__ = "train_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.BOOKED)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="train_bookings")
    train = relationship("TrainModel", back_populates="bookings")


class TrainPaymentModel(Base):
    __tablename__ = "train_payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    seats_count = Column(Integer, nullable=False, default=1)
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PAID)
    transaction_id = Column(String(128), unique=True, index=True, nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="train_payments")
    train = relationship("TrainModel", back_populates="payments")


class HotelModel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    price_per_night = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("HotelBookingModel", back_populates="hotel")
    payments = relationship("HotelPaymentModel", back_populates="hotel")


class HotelBookingModel(Base):
    __tablename__ = "hotel_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.BOOKED)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="hotel_bookings")
    hotel = relationship("HotelModel", back_populates="bookings")


class HotelPaymentModel(Base):
    __tablename__ = "hotel_payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    rooms_count = Column(Integer, nullable=False, default=1)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PAID)
    transaction_id = Column(String(128), unique=True, index=True, nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="hotel_payments")
    hotel = relationship("HotelModel", back_populates="payments")


class PackageModel(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("PackageBookingModel", back_populates="package")
    payments = relationship("PackagePaymentModel", back_populates="package")


class PackageBookingModel(Base):
    __tablename__ = "package_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.BOOKED)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="package_bookings")
    package = relationship("PackageModel", back_populates="bookings")


class PackagePaymentModel(Base):
    __tablename__ = "package_payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    travelers_count = Column(Integer, nullable=False, default=1)
    start_date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PAID)
    transaction_id = Column(String(128), unique=True, index=True, nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="package_payments")
    package = relationship("PackageModel", back_populates="payments")


class PlaceModel(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    district = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BudgetModel(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_name = Column(String(255), nullable=False)
    total_budget = Column(Float, nullable=False)
    destination = Column(String(255), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    travelers = Column(Integer, default=1)
    currency = Column(String(10), default="USD")
    flights_transport_amount = Column(Float, default=0.0)
    flights_transport_notes = Column(Text, nullable=True)
    accommodation_amount = Column(Float, default=0.0)
    accommodation_notes = Column(Text, nullable=True)
    food_amount = Column(Float, default=0.0)
    food_notes = Column(Text, nullable=True)
    local_transport_amount = Column(Float, default=0.0)
    local_transport_notes = Column(Text, nullable=True)
    activities_amount = Column(Float, default=0.0)
    activities_notes = Column(Text, nullable=True)
    shopping_amount = Column(Float, default=0.0)
    shopping_notes = Column(Text, nullable=True)
    insurance_amount = Column(Float, default=0.0)
    insurance_notes = Column(Text, nullable=True)
    misc_amount = Column(Float, default=0.0)
    misc_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="budgets")
