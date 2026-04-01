from datetime import datetime
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import (
    PackageModel,
    PackageBookingModel,
    PackagePaymentModel,
    BookingStatus,
    PaymentMethod,
    PaymentStatus,
    UserModel,
)
from app.schemas import (
    PackageCreate,
    PackageResponse,
    PackageBookingCreate,
    PackageBookingResponse,
    PackageBookWithPaymentRequest,
    PackageBookingWithPaymentResponse,
    PackagePaymentResponse,
)
from app.routers.dependencies import get_current_user_email

router = APIRouter(prefix="/packages", tags=["Packages"])

TAXES_AND_FEES_PER_BOOKING = 150.0


def _validate_package_card_payload(request: PackageBookWithPaymentRequest) -> None:
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


@router.get("/", response_model=List[PackageResponse])
def get_packages(db: Session = Depends(get_db)):
    """Get all available packages"""
    packages = db.query(PackageModel).all()
    return packages


@router.get("/{package_id}", response_model=PackageResponse)
def get_package(package_id: int, db: Session = Depends(get_db)):
    """Get a specific package by ID"""
    package = db.query(PackageModel).filter(PackageModel.id == package_id).first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package not found"
        )

    return package


@router.post(
    "/book", response_model=PackageBookingResponse, status_code=status.HTTP_201_CREATED
)
def book_package(
    booking: PackageBookingCreate,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a holiday package"""

    # Get user
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if package exists
    package = (
        db.query(PackageModel).filter(PackageModel.id == booking.package_id).first()
    )
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package not found"
        )

    # Create booking
    db_booking = PackageBookingModel(
        user_id=user.id,
        package_id=booking.package_id,
        start_date=booking.start_date,
        status=BookingStatus.BOOKED,
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking


@router.post(
    "/book-with-payment",
    response_model=PackageBookingWithPaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_package_with_payment(
    request: PackageBookWithPaymentRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a package and capture payment with DB persistence"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    package = (
        db.query(PackageModel).filter(PackageModel.id == request.package_id).first()
    )
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found",
        )

    if request.start_date.date() < datetime.utcnow().date():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be in the past",
        )

    _validate_package_card_payload(request)

    total_amount = round(
        (package.price * request.travelers_count) + TAXES_AND_FEES_PER_BOOKING,
        2,
    )
    transaction_id = f"PKTRX-{uuid.uuid4().hex[:12].upper()}"
    booking_reference = (
        f"PBK-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    )

    db_booking = PackageBookingModel(
        user_id=user.id,
        package_id=request.package_id,
        start_date=request.start_date,
        status=BookingStatus.BOOKED,
    )
    db.add(db_booking)
    db.flush()

    payment_row = PackagePaymentModel(
        booking_reference=booking_reference,
        user_id=user.id,
        package_id=request.package_id,
        travelers_count=request.travelers_count,
        start_date=request.start_date,
        amount=total_amount,
        payment_method=PaymentMethod(request.payment_method.value),
        payment_status=PaymentStatus.PAID,
        transaction_id=transaction_id,
    )
    db.add(payment_row)
    db.commit()
    db.refresh(db_booking)
    db.refresh(payment_row)

    return PackageBookingWithPaymentResponse(
        booking_id=db_booking.id,
        package_id=db_booking.package_id,
        user_id=db_booking.user_id,
        start_date=db_booking.start_date,
        travelers_count=payment_row.travelers_count,
        amount=payment_row.amount,
        status=db_booking.status,
        message="Package booked and payment captured successfully",
        payment=PackagePaymentResponse(
            booking_reference=payment_row.booking_reference,
            transaction_id=payment_row.transaction_id,
            payment_method=payment_row.payment_method,
            payment_status=payment_row.payment_status.value,
            amount=payment_row.amount,
        ),
    )


@router.get("/bookings/user", response_model=List[PackageBookingResponse])
def get_user_package_bookings(
    email: str = Depends(get_current_user_email), db: Session = Depends(get_db)
):
    """Get all package bookings for current user"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    bookings = (
        db.query(PackageBookingModel)
        .filter(PackageBookingModel.user_id == user.id)
        .all()
    )

    return bookings


@router.delete("/cancel/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_package_booking(
    booking_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Cancel a package booking"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    booking = (
        db.query(PackageBookingModel)
        .filter(
            PackageBookingModel.id == booking_id, PackageBookingModel.user_id == user.id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return {"message": "Package booking cancelled successfully"}
