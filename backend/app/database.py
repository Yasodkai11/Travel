from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://root:@localhost/travelharbor_hub"
)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before using
    poolclass=NullPool,  # Use NullPool for development
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    _ensure_budget_columns()


def _ensure_budget_columns():
    """Add missing budget columns for existing databases without migrations."""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    if "budgets" not in table_names:
        return

    existing = {col["name"] for col in inspector.get_columns("budgets")}
    required_columns = {
        "destination": "VARCHAR(255) NULL",
        "start_date": "DATETIME NULL",
        "end_date": "DATETIME NULL",
        "travelers": "INT DEFAULT 1",
        "currency": "VARCHAR(10) DEFAULT 'USD'",
        "flights_transport_amount": "FLOAT DEFAULT 0",
        "flights_transport_notes": "TEXT NULL",
        "accommodation_amount": "FLOAT DEFAULT 0",
        "accommodation_notes": "TEXT NULL",
        "food_amount": "FLOAT DEFAULT 0",
        "food_notes": "TEXT NULL",
        "local_transport_amount": "FLOAT DEFAULT 0",
        "local_transport_notes": "TEXT NULL",
        "activities_amount": "FLOAT DEFAULT 0",
        "activities_notes": "TEXT NULL",
        "shopping_amount": "FLOAT DEFAULT 0",
        "shopping_notes": "TEXT NULL",
        "insurance_amount": "FLOAT DEFAULT 0",
        "insurance_notes": "TEXT NULL",
        "misc_amount": "FLOAT DEFAULT 0",
        "misc_notes": "TEXT NULL",
    }

    missing = [
        (name, ddl) for name, ddl in required_columns.items() if name not in existing
    ]
    if not missing:
        return

    with engine.begin() as conn:
        for name, ddl in missing:
            conn.execute(text(f"ALTER TABLE budgets ADD COLUMN {name} {ddl}"))
