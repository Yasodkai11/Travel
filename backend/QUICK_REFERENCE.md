# TravelHarbor Hub Backend - Quick Reference Guide

## Installation (Windows)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Edit `.env`:

```
DATABASE_URL=mysql+pymysql://root:password@localhost/travelharbor_hub
```

## Run Server

```bash
uvicorn app.main:app --reload
```

Server at: **http://localhost:8000**

## Create Sample Data

```bash
python seed_data.py
```

Test credentials:

- Email: john@example.com
- Password: password123

## API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Quick API Tests

### Register

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"User","email":"user@example.com","password":"pass123"
  }'
```

### Login (get token)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Use token

```bash
TOKEN="your_token_here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/trains
```

## File Structure Quick Map

```
app/main.py              → Start here, FastAPI app
app/database.py          → Database connection
app/models/__init__.py   → Database models
app/schemas/__init__.py  → Data validation
app/routers/             → API endpoints
  └─ auth.py            → Login/Register
  └─ trains.py          → Train booking
  └─ hotels.py          → Hotel booking
  └─ packages.py        → Package booking
  └─ places.py          → Places info
  └─ budget.py          → Budget planner
  └─ weather.py         → Weather API
app/utils/auth.py       → JWT & password
```

## Common Tasks

### Add a new endpoint

1. Define schema in `app/schemas/__init__.py`
2. Add route in `app/routers/your_router.py`:

```python
@router.post("/endpoint")
def your_endpoint(data: YourSchema, db: Session = Depends(get_db)):
    # Your code
    return result
```

### Get authenticated user

```python
from app.routers.dependencies import get_current_user_email
from sqlalchemy.orm import Session

def my_endpoint(
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.email == email).first()
```

### Query database

```python
from app.models import TrainModel

# Get all
trains = db.query(TrainModel).all()

# Get one
train = db.query(TrainModel).filter(TrainModel.id == 1).first()

# Create
new_train = TrainModel(train_name="Express", price=2500)
db.add(new_train)
db.commit()
db.refresh(new_train)

# Update
train.price = 3000
db.commit()

# Delete
db.delete(train)
db.commit()
```

### Query with relationships

```python
booking = db.query(TrainBookingModel).filter(
    TrainBookingModel.id == 1
).first()

# Access related train
train = booking.train
```

## HTTP Status Codes

| Code | Meaning           |
| ---- | ----------------- |
| 200  | Success (GET/PUT) |
| 201  | Created (POST)    |
| 204  | Deleted           |
| 400  | Bad request       |
| 401  | Unauthorized      |
| 404  | Not found         |
| 500  | Server error      |

## Error Response Format

```json
{
  "detail": "Error message here"
}
```

## Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoint Categories

### Public (No Auth)

- GET /
- GET /health
- GET /trains
- GET /hotels
- GET /packages
- GET /places
- POST /auth/register
- POST /auth/login
- GET /weather/{city}

### Protected (Auth Required)

- GET /auth/me
- POST /trains/book
- GET /trains/bookings/user
- DELETE /trains/cancel/{id}
- POST /hotels/book
- GET /hotels/bookings/user
- DELETE /hotels/cancel/{id}
- POST /packages/book
- GET /packages/bookings/user
- DELETE /packages/cancel/{id}
- POST /budget/create
- GET /budget/user
- GET /budget/{id}
- PUT /budget/{id}
- DELETE /budget/{id}

## Environment Variables

```env
DATABASE_URL=mysql+pymysql://user:pass@host/db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
WEATHER_API_KEY=openweathermap-key
HOST=0.0.0.0
PORT=8000
```

## Testing Command

```bash
# Using Swagger UI
http://localhost:8000/docs

# Using cURL
curl -X GET http://localhost:8000/trains

# Using cURL with auth
TOKEN="your_token"
curl -X GET http://localhost:8000/trains/bookings/user \
  -H "Authorization: Bearer $TOKEN"
```

## Database Models

```
User → can have → TrainBookings
User → can have → HotelBookings
User → can have → PackageBookings
User → can have → Budgets

Train → referenced by → TrainBookings
Hotel → referenced by → HotelBookings
Package → referenced by → PackageBookings
Place → standalone
```

## Debugging Tips

### See SQL queries

Edit `app/database.py`: set `echo=True`

### Check token validity

Decode at: https://jwt.io/

### View database

Use MySQL GUI or command line:

```sql
USE travelharbor_hub;
SELECT * FROM users;
DESCRIBE trains;
```

### Test endpoint offline

Use Postman or cURL

### Check server logs

Watch console output from uvicorn

## Common Errors

| Error               | Solution                                 |
| ------------------- | ---------------------------------------- |
| ModuleNotFoundError | Check venv is activated                  |
| Port 8000 in use    | Use --port 8001 or kill process          |
| DB connection error | Check .env DATABASE_URL                  |
| 401 Unauthorized    | Check token in Authorization header      |
| 404 Not Found       | Wrong endpoint or resource doesn't exist |
| CORS error          | Check allow_origins in app/main.py       |

## Useful Commands

```bash
# Activate venv
venv\Scripts\activate

# Deactivate venv
deactivate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload

# Run on different port
uvicorn app.main:app --reload --port 8001

# Seed database
python seed_data.py

# View installed packages
pip list

# Freeze dependencies
pip freeze > requirements.txt
```

## MySQL CLI Cheat Sheet

```bash
# Login
mysql -u root -p

# List databases
SHOW DATABASES;

# Use database
USE travelharbor_hub;

# List tables
SHOW TABLES;

# View table structure
DESCRIBE users;

# Count records
SELECT COUNT(*) FROM users;

# See all users
SELECT * FROM users;

# Clear data (careful!)
DELETE FROM table_name;

# Drop database (very careful!)
DROP DATABASE travelharbor_hub;
```

## Documentation Files

- **README.md** - Full documentation
- **SETUP.md** - Installation guide
- **PROJECT_SUMMARY.md** - Project overview
- **FRONTEND_INTEGRATION.md** - Frontend examples
- **TESTING_GUIDE.md** - Testing examples

## Production Checklist

- [ ] Change SECRET_KEY
- [ ] Update DATABASE_URL for production
- [ ] Set echo=False in database.py
- [ ] Configure CORS properly
- [ ] Test with production database
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Load test the API
- [ ] Backup database
- [ ] Set up logging

## Quick Links

- API Docs: http://localhost:8000/docs
- Backend repo: `c:\Users\alank\Downloads\travel\backend\`
- Frontend repo: `c:\Users\alank\Downloads\travel\`

## Useful Package Docs

- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/
- JWT (python-jose): https://github.com/mpdavis/python-jose

---

**Quick Start**: `uvicorn app.main:app --reload` → http://localhost:8000/docs
