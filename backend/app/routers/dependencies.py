from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserModel
from app.utils.auth import decode_token


def get_token_from_header(authorization: str = Header(default=None)) -> str:
    """Extract and validate token from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Use Authorization: Bearer <token>",
        )

    token = authorization[7:]  # Remove "Bearer " prefix
    return token


def get_current_user(
    authorization: str = Header(default=None), db: Session = Depends(get_db)
) -> UserModel:
    """Get current authenticated user from token"""
    token = get_token_from_header(authorization)

    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    user = db.query(UserModel).filter(UserModel.email == token_data["email"]).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


def get_current_user_email(authorization: str = Header(default=None)) -> str:
    """Get current user email from token"""
    token = get_token_from_header(authorization)

    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    return token_data["email"]
