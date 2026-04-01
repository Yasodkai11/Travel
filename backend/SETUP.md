# Quick Start Guide - TravelHarbor Hub Backend

## Prerequisites

- Python 3.8+ installed
- MySQL 8.0+ running
- Git (optional)

## Step 1: Create the Database

Open MySQL and create the database:

```sql
CREATE DATABASE travelharbor_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Setup Python Environment

Navigate to the backend directory and create a virtual environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 4: Configure Environment Variables

Edit the `.env` file with your MySQL credentials:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/travelharbor_hub
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
WEATHER_API_KEY=your-openweathermap-api-key
HOST=0.0.0.0
PORT=8000
```

## Step 5: Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or use the main.py directly
python app/main.py
```

The server will start at: **http://localhost:8000**

## Step 6: Populate Sample Data (Optional)

In a new terminal (with venv activated):

```bash
python seed_data.py
```

This creates sample users, trains, hotels, packages, and places.

## Step 7: Access the API

**Swagger UI:** http://localhost:8000/docs
**ReDoc:** http://localhost:8000/redoc

## Testing the API

### Register a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### Use the Token

```bash
curl -X GET http://localhost:8000/trains \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure Overview

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # Database connection
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic validation schemas
│   ├── routers/                # API route handlers
│   │   ├── auth.py
│   │   ├── trains.py
│   │   ├── hotels.py
│   │   ├── packages.py
│   │   ├── places.py
│   │   ├── budget.py
│   │   ├── weather.py
│   │   └── dependencies.py
│   ├── services/               # Business logic
│   └── utils/
│       └── auth.py             # JWT and password utilities
├── requirements.txt
├── .env
├── .env.example
├── seed_data.py               # Script to populate sample data
├── README.md                  # Full documentation
└── FRONTEND_INTEGRATION.md    # Frontend integration guide
```

## Common Commands

```bash
# Deactivate virtual environment
deactivate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check if database is connected
# Try registering a user via the API

# View all existing endpoints
# Visit http://localhost:8000/docs
```

## Using Swagger UI for Testing

1. Go to http://localhost:8000/docs
2. Click "Authorize" button (top right)
3. Enter your token from login response
4. Try out endpoints

## Troubleshooting

**Port 8000 already in use:**

```bash
uvicorn app.main:app --reload --port 8001
```

**Database connection error:**

```bash
# Check MySQL is running
# Verify credentials in .env
# Ensure database exists
```

**ModuleNotFoundError:**

```bash
# Ensure you're in the backend directory
# Ensure virtual environment is activated
# Run: pip install -r requirements.txt
```

## Next Steps

1. **Frontend Integration**: See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Add More Features**: Extend routers with additional endpoints
4. **Production Deployment**: Configure for production environment

## Need Help?

- Check the full [README.md](README.md)
- Review API docs at http://localhost:8000/docs
- See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for frontend examples

---

You're all set! The backend is ready to serve your React frontend application.
