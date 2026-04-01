from datetime import datetime
import re
import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import (
    HotelModel,
    HotelBookingModel,
    HotelPaymentModel,
    BookingStatus,
    PaymentMethod,
    PaymentStatus,
    UserModel,
)
from app.schemas import (
    HotelResponse,
    HotelBookingCreate,
    HotelBookingResponse,
    HotelAvailabilityResponse,
    HotelBookWithPaymentRequest,
    HotelBookingWithPaymentResponse,
    HotelPaymentResponse,
)
from app.routers.dependencies import get_current_user_email

router = APIRouter(prefix="/hotels", tags=["Hotels"])

TOTAL_ROOMS_PER_HOTEL = 40
TAXES_AND_FEES_PER_BOOKING = 22.0
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _validate_hotel_dates(check_in: datetime, check_out: datetime) -> None:
    if check_in >= check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date must be before check-out date",
        )


def _calculate_available_rooms(
    db: Session, hotel_id: int, check_in: datetime, check_out: datetime
) -> int:
    overlapping_payments = (
        db.query(HotelPaymentModel)
        .filter(
            HotelPaymentModel.hotel_id == hotel_id,
            HotelPaymentModel.payment_status == PaymentStatus.PAID,
            HotelPaymentModel.check_in < check_out,
            HotelPaymentModel.check_out > check_in,
        )
        .all()
    )
    rooms_taken = sum(payment.rooms_count for payment in overlapping_payments)
    return max(0, TOTAL_ROOMS_PER_HOTEL - rooms_taken)


def _validate_card_payload(request: HotelBookWithPaymentRequest) -> None:
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


@router.get("/", response_model=List[HotelResponse])
def get_hotels(db: Session = Depends(get_db)):
    """Get all available hotels"""
    hotels = db.query(HotelModel).all()
    return hotels


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """Get a specific hotel by ID"""
    hotel = db.query(HotelModel).filter(HotelModel.id == hotel_id).first()

    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found"
        )

    return hotel


@router.post("/{hotel_id}/upload-image")
async def upload_hotel_image(
    hotel_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload and attach an image to a hotel"""
    hotel = db.query(HotelModel).filter(HotelModel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        )

    ext = (image.filename or "").rsplit(".", 1)[-1].lower() if image.filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, or WEBP images are allowed",
        )

    if image.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image content type",
        )

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    images_dir = os.path.join(project_root, "static", "images")
    os.makedirs(images_dir, exist_ok=True)

    new_filename = f"{uuid.uuid4().hex}.{ext}"
    absolute_image_path = os.path.join(images_dir, new_filename)

    file_bytes = await image.read()
    with open(absolute_image_path, "wb") as output_file:
        output_file.write(file_bytes)

    if hotel.image_url:
        old_relative_path = hotel.image_url.lstrip("/").replace("/", os.sep)
        old_absolute_path = os.path.join(project_root, old_relative_path)
        if os.path.isfile(old_absolute_path):
            os.remove(old_absolute_path)

    hotel.image_url = f"/static/images/{new_filename}"
    db.commit()
    db.refresh(hotel)

    return {"image_url": hotel.image_url}


@router.get("/{hotel_id}/availability", response_model=HotelAvailabilityResponse)
def get_hotel_availability(
    hotel_id: int,
    check_in: datetime,
    check_out: datetime,
    rooms: int = 1,
    db: Session = Depends(get_db),
):
    """Get room availability for a hotel in a date range"""
    hotel = db.query(HotelModel).filter(HotelModel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        )

    if rooms < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested rooms must be at least 1",
        )

    _validate_hotel_dates(check_in, check_out)
    available_rooms = _calculate_available_rooms(db, hotel_id, check_in, check_out)

    return HotelAvailabilityResponse(
        hotel_id=hotel_id,
        requested_rooms=rooms,
        available_rooms=available_rooms,
        can_book=available_rooms >= rooms,
    )


@router.post(
    "/book", response_model=HotelBookingResponse, status_code=status.HTTP_201_CREATED
)
def book_hotel(
    booking: HotelBookingCreate,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a hotel"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    hotel = db.query(HotelModel).filter(HotelModel.id == booking.hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found"
        )

    _validate_hotel_dates(booking.check_in, booking.check_out)

    db_booking = HotelBookingModel(
        user_id=user.id,
        hotel_id=booking.hotel_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        status=BookingStatus.BOOKED,
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking


@router.post(
    "/book-with-payment",
    response_model=HotelBookingWithPaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_hotel_with_payment(
    request: HotelBookWithPaymentRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Book a hotel and capture payment with DB persistence"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    hotel = db.query(HotelModel).filter(HotelModel.id == request.hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        )

    _validate_hotel_dates(request.check_in, request.check_out)

    available_rooms = _calculate_available_rooms(
        db, request.hotel_id, request.check_in, request.check_out
    )
    if request.rooms_count > available_rooms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {available_rooms} rooms available for selected dates",
        )

    _validate_card_payload(request)

    nights = max(1, (request.check_out.date() - request.check_in.date()).days)
    total_amount = round(
        (hotel.price_per_night * request.rooms_count * nights)
        + TAXES_AND_FEES_PER_BOOKING,
        2,
    )
    transaction_id = f"HTRX-{uuid.uuid4().hex[:12].upper()}"
    booking_reference = (
        f"HBK-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    )

    db_booking = HotelBookingModel(
        user_id=user.id,
        hotel_id=request.hotel_id,
        check_in=request.check_in,
        check_out=request.check_out,
        status=BookingStatus.BOOKED,
    )
    db.add(db_booking)
    db.flush()

    payment_row = HotelPaymentModel(
        booking_reference=booking_reference,
        user_id=user.id,
        hotel_id=request.hotel_id,
        rooms_count=request.rooms_count,
        check_in=request.check_in,
        check_out=request.check_out,
        amount=total_amount,
        payment_method=PaymentMethod(request.payment_method.value),
        payment_status=PaymentStatus.PAID,
        transaction_id=transaction_id,
    )
    db.add(payment_row)
    db.commit()
    db.refresh(db_booking)
    db.refresh(payment_row)

    return HotelBookingWithPaymentResponse(
        booking_id=db_booking.id,
        hotel_id=db_booking.hotel_id,
        user_id=db_booking.user_id,
        check_in=db_booking.check_in,
        check_out=db_booking.check_out,
        rooms_count=payment_row.rooms_count,
        nights=nights,
        amount=payment_row.amount,
        status=db_booking.status,
        message="Hotel booked and payment captured successfully",
        payment=HotelPaymentResponse(
            booking_reference=payment_row.booking_reference,
            transaction_id=payment_row.transaction_id,
            payment_method=payment_row.payment_method,
            payment_status=payment_row.payment_status.value,
            amount=payment_row.amount,
        ),
    )


@router.get("/bookings/user", response_model=List[HotelBookingResponse])
def get_user_hotel_bookings(
    email: str = Depends(get_current_user_email), db: Session = Depends(get_db)
):
    """Get all hotel bookings for current user"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    bookings = (
        db.query(HotelBookingModel).filter(HotelBookingModel.user_id == user.id).all()
    )

    return bookings


@router.delete("/cancel/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_hotel_booking(
    booking_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Cancel a hotel booking"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    booking = (
        db.query(HotelBookingModel)
        .filter(
            HotelBookingModel.id == booking_id, HotelBookingModel.user_id == user.id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return {"message": "Hotel booking cancelled successfully"}
