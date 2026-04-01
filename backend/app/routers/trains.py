from datetime import datetime
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import (
    TrainModel,
    TrainBookingModel,
    BookingStatus,
    TrainPaymentModel,
    PaymentMethod,
    PaymentStatus,
)
from app.schemas import (
    TrainResponse,
    TrainBookingCreate,
    TrainBookingResponse,
    TrainAvailabilityResponse,
    TrainBookWithPaymentRequest,
    TrainBookingWithPaymentResponse,
    TrainPaymentResponse,
)
from app.routers.dependencies import get_current_user_email
from app.models import UserModel

router = APIRouter(prefix="/trains", tags=["Trains"])

TOTAL_SEATS_PER_TRAIN = 60
TAXES_AND_FEES_PER_BOOKING = 2.0


def _calculate_available_seats(db: Session, train_id: int) -> int:
    paid_entries = (
        db.query(TrainPaymentModel)
        .filter(
            TrainPaymentModel.train_id == train_id,
            TrainPaymentModel.payment_status == PaymentStatus.PAID,
        )
        .all()
    )
    seats_taken = sum(entry.seats_count for entry in paid_entries)
    return max(0, TOTAL_SEATS_PER_TRAIN - seats_taken)


def _validate_card_payload(request: TrainBookWithPaymentRequest) -> None:
    if request.payment_method.value != PaymentMethod.CARD.value:
        return

    if not request.card_number or not re.fullmatch(r"\d{12,19}", request.card_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid card number",
        )

    if not request.card_holder or len(request.card_holder.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Card holder name is required",
        )

    if not request.expiry or not re.fullmatch(
        r"(0[1-9]|1[0-2])/[0-9]{2}", request.expiry
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry must be in MM/YY format",
        )

    if not request.cvv or not re.fullmatch(r"\d{3,4}", request.cvv):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CVV",
        )


@router.get("/", response_model=List[TrainResponse])
def get_trains(db: Session = Depends(get_db)):
    """Get all available trains"""
    trains = db.query(TrainModel).all()
    return trains


@router.get("/{train_id}", response_model=TrainResponse)
def get_train(train_id: int, db: Session = Depends(get_db)):
    """Get a specific train by ID"""
    train = db.query(TrainModel).filter(TrainModel.id == train_id).first()

    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Train not found"
        )

    return train


@router.get("/{train_id}/availability", response_model=TrainAvailabilityResponse)
def get_train_availability(
    train_id: int,
    seats: int = 1,
    db: Session = Depends(get_db),
):
    """Get seat availability for a train"""
    train = db.query(TrainModel).filter(TrainModel.id == train_id).first()
    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Train not found",
        )

    if seats < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested seats must be at least 1",
        )

    available_seats = _calculate_available_seats(db, train_id)
    return TrainAvailabilityResponse(
        train_id=train_id,
        requested_seats=seats,
        available_seats=available_seats,
        can_book=available_seats >= seats,
    )


@router.post(
    "/book", response_model=TrainBookingResponse, status_code=status.HTTP_201_CREATED
)
def book_train(
    booking: TrainBookingCreate,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a train journey"""

    # Get user
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if train exists
    train = db.query(TrainModel).filter(TrainModel.id == booking.train_id).first()
    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Train not found"
        )

    # Create booking
    db_booking = TrainBookingModel(
        user_id=user.id, train_id=booking.train_id, status=BookingStatus.BOOKED
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking


@router.post(
    "/book-with-payment",
    response_model=TrainBookingWithPaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_train_with_payment(
    request: TrainBookWithPaymentRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a train and store payment transaction in the database"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    train = db.query(TrainModel).filter(TrainModel.id == request.train_id).first()
    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Train not found",
        )

    available_seats = _calculate_available_seats(db, request.train_id)
    if request.seats_count > available_seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {available_seats} seats available",
        )

    _validate_card_payload(request)

    total_amount = round(
        (train.price * request.seats_count) + TAXES_AND_FEES_PER_BOOKING, 2
    )
    transaction_id = f"TRX-{uuid.uuid4().hex[:12].upper()}"
    booking_reference = (
        f"BKG-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    )

    db_booking = TrainBookingModel(
        user_id=user.id,
        train_id=request.train_id,
        status=BookingStatus.BOOKED,
    )
    db.add(db_booking)
    db.flush()

    payment_row = TrainPaymentModel(
        booking_reference=booking_reference,
        user_id=user.id,
        train_id=request.train_id,
        seats_count=request.seats_count,
        amount=total_amount,
        payment_method=PaymentMethod(request.payment_method.value),
        payment_status=PaymentStatus.PAID,
        transaction_id=transaction_id,
    )
    db.add(payment_row)
    db.commit()
    db.refresh(db_booking)
    db.refresh(payment_row)

    return TrainBookingWithPaymentResponse(
        booking_id=db_booking.id,
        train_id=db_booking.train_id,
        user_id=db_booking.user_id,
        seats_count=payment_row.seats_count,
        amount=payment_row.amount,
        status=db_booking.status,
        message="Train booked and payment captured successfully",
        payment=TrainPaymentResponse(
            booking_reference=payment_row.booking_reference,
            transaction_id=payment_row.transaction_id,
            payment_method=payment_row.payment_method,
            payment_status=payment_row.payment_status.value,
            amount=payment_row.amount,
        ),
    )


@router.get("/bookings/user", response_model=List[TrainBookingResponse])
def get_user_train_bookings(
    email: str = Depends(get_current_user_email), db: Session = Depends(get_db)
):
    """Get all train bookings for current user"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    bookings = (
        db.query(TrainBookingModel).filter(TrainBookingModel.user_id == user.id).all()
    )

    return bookings


@router.delete("/cancel/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_train_booking(
    booking_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Cancel a train booking"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    booking = (
        db.query(TrainBookingModel)
        .filter(
            TrainBookingModel.id == booking_id, TrainBookingModel.user_id == user.id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return {"message": "Train booking cancelled successfully"}
