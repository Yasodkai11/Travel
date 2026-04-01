from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import BudgetModel, UserModel
from app.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from app.routers.dependencies import get_current_user_email

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.post(
    "/create", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED
)
def create_budget(
    budget: BudgetCreate,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Create a new travel budget"""

    # Get user
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Create budget with full planner fields
    db_budget = BudgetModel(
        user_id=user.id,
        trip_name=budget.trip_name,
        total_budget=budget.total_budget,
        destination=budget.destination,
        start_date=budget.start_date,
        end_date=budget.end_date,
        travelers=budget.travelers,
        currency=budget.currency,
        flights_transport_amount=budget.flights_transport_amount,
        flights_transport_notes=budget.flights_transport_notes,
        accommodation_amount=budget.accommodation_amount,
        accommodation_notes=budget.accommodation_notes,
        food_amount=budget.food_amount,
        food_notes=budget.food_notes,
        local_transport_amount=budget.local_transport_amount,
        local_transport_notes=budget.local_transport_notes,
        activities_amount=budget.activities_amount,
        activities_notes=budget.activities_notes,
        shopping_amount=budget.shopping_amount,
        shopping_notes=budget.shopping_notes,
        insurance_amount=budget.insurance_amount,
        insurance_notes=budget.insurance_notes,
        misc_amount=budget.misc_amount,
        misc_notes=budget.misc_notes,
    )

    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)

    return db_budget


@router.get("/user", response_model=List[BudgetResponse])
def get_user_budgets(
    email: str = Depends(get_current_user_email), db: Session = Depends(get_db)
):
    """Get all budgets for current user"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    budgets = db.query(BudgetModel).filter(BudgetModel.user_id == user.id).all()

    return budgets


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Get a specific budget"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    budget = (
        db.query(BudgetModel)
        .filter(BudgetModel.id == budget_id, BudgetModel.user_id == user.id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
        )

    return budget


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Update a budget"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    budget = (
        db.query(BudgetModel)
        .filter(BudgetModel.id == budget_id, BudgetModel.user_id == user.id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
        )

    # Update fields
    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)

    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
def delete_budget(
    budget_id: int,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    """Delete a budget"""

    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    budget = (
        db.query(BudgetModel)
        .filter(BudgetModel.id == budget_id, BudgetModel.user_id == user.id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {"message": "Budget deleted successfully"}
