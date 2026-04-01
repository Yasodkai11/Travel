from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import PlaceModel
from app.schemas import PlaceCreate, PlaceResponse

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("/", response_model=List[PlaceResponse])
def get_places(db: Session = Depends(get_db)):
    """Get all famous places in Sri Lanka"""
    places = db.query(PlaceModel).all()
    return places


@router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    """Get a specific place by ID"""
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()

    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Place not found"
        )

    return place


@router.get("/district/{district}", response_model=List[PlaceResponse])
def get_places_by_district(district: str, db: Session = Depends(get_db)):
    """Get all places in a specific district"""
    places = db.query(PlaceModel).filter(PlaceModel.district == district).all()

    if not places:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No places found in this district",
        )

    return places
