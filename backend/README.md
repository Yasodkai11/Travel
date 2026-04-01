# TravelHarbor Hub - Backend API

A comprehensive, production-ready REST API backend for a travel booking web application built with FastAPI, SQLAlchemy, and MySQL.

## Features

- ✅ User Authentication (Register, Login with JWT)
- ✅ Train Booking System
- ✅ Hotel Booking System
- ✅ Holiday Packages
- ✅ Famous Places Database (Sri Lanka)
- ✅ Travel Budget Planner
- ✅ Weather Integration
- ✅ Complete API Documentation (Swagger/OpenAPI)
- ✅ Data Validation with Pydantic
- ✅ Password Hashing with Bcrypt
- ✅ CORS Support for Frontend Integration

## Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Data Validation**: Pydantic
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Passlib with Bcrypt
- **Async**: HTTP client with HTTPX

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database connection and session management
│   ├── models/
│   │   └── __init__.py        # SQLAlchemy models
│   ├── schemas/
│   │   └── __init__.py        # Pydantic schemas for validation
│   ├── routers/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── trains.py          # Train booking endpoints
│   │   ├── hotels.py          # Hotel booking endpoints
│   │   ├── packages.py        # Holiday package endpoints
│   │   ├── places.py          # Places endpoints
│   │   ├── budget.py          # Budget planner endpoints
│   │   └── weather.py         # Weather integration endpoints
│   ├── services/
│   │   └── __init__.py        # Business logic services
│   └── utils/
│       ├── __init__.py
│       └── auth.py            # JWT and password utilities
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## Prerequisites

- Python 3.8 or higher
- MySQL 8.0 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation & Setup

### 1. Create a MySQL Database

```sql
CREATE DATABASE travelharbor_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Clone and Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix or MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Edit `.env` file with your database credentials:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/travelharbor_hub
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
WEATHER_API_KEY=your-openweathermap-api-key
```

### 4. Run the Application

```bash
# Development mode with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile

### Trains

- `GET /trains/` - Get all trains
- `GET /trains/{train_id}` - Get train details
- `POST /trains/book` - Book a train
- `GET /trains/bookings/user` - Get user's train bookings
- `DELETE /trains/cancel/{booking_id}` - Cancel train booking

### Hotels

- `GET /hotels/` - Get all hotels
- `GET /hotels/{hotel_id}` - Get hotel details
- `POST /hotels/book` - Book a hotel
- `GET /hotels/bookings/user` - Get user's hotel bookings
- `DELETE /hotels/cancel/{booking_id}` - Cancel hotel booking

### Packages

- `GET /packages/` - Get all holiday packages
- `GET /packages/{package_id}` - Get package details
- `POST /packages/book` - Book a package
- `GET /packages/bookings/user` - Get user's package bookings
- `DELETE /packages/cancel/{booking_id}` - Cancel package booking

### Places

- `GET /places/` - Get all places
- `GET /places/{place_id}` - Get place details
- `GET /places/district/{district}` - Get places by district

### Budget

- `POST /budget/create` - Create a travel budget
- `GET /budget/user` - Get user's budgets
- `GET /budget/{budget_id}` - Get specific budget
- `PUT /budget/{budget_id}` - Update budget
- `DELETE /budget/{budget_id}` - Delete budget

### Weather

- `GET /weather/{city}` - Get weather information for a city

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to Authenticate:

1. **Register a User**:

   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "securepassword123"
     }'
   ```

2. **Login to Get Token**:

   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "securepassword123"
     }'
   ```

   Response:

   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer",
     "user": {
       "id": 1,
       "name": "John Doe",
       "email": "john@example.com",
       "created_at": "2024-01-15T10:30:00"
     }
   }
   ```

3. **Use Token in Protected Endpoints**:
   ```bash
   curl -X GET http://localhost:8000/trains/bookings/user \
     -H "Authorization: Bearer <your_access_token>"
   ```

## Database Models

### User Model

- `id` (PK): Integer
- `name`: String(255)
- `email`: String(255) - Unique
- `password_hash`: String(255)
- `created_at`: DateTime

### Train Model

- `id` (PK): Integer
- `train_name`: String(255)
- `departure_station`: String(255)
- `arrival_station`: String(255)
- `departure_time`: DateTime
- `arrival_time`: DateTime
- `price`: Float
- `created_at`: DateTime

### Hotel Model

- `id` (PK): Integer
- `name`: String(255)
- `location`: String(255)
- `price_per_night`: Float
- `rating`: Float(0-5)
- `description`: Text
- `created_at`: DateTime

### Package Model

- `id` (PK): Integer
- `title`: String(255)
- `location`: String(255)
- `duration_days`: Integer
- `price`: Float
- `description`: Text
- `created_at`: DateTime

### Place Model

- `id` (PK): Integer
- `name`: String(255)
- `district`: String(255)
- `description`: Text
- `image_url`: String(500)
- `created_at`: DateTime

### Budget Model

- `id` (PK): Integer
- `user_id` (FK): Integer
- `trip_name`: String(255)
- `total_budget`: Float
- `food_cost`: Float
- `transport_cost`: Float
- `hotel_cost`: Float
- `activities_cost`: Float
- `created_at`: DateTime

## Example Requests

### Register a New User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### Book a Train

```bash
curl -X POST http://localhost:8000/trains/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "train_id": 1
  }'
```

### Book a Hotel

```bash
curl -X POST http://localhost:8000/hotels/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "hotel_id": 1,
    "check_in": "2024-02-01T14:00:00",
    "check_out": "2024-02-05T11:00:00"
  }'
```

### Create a Travel Budget

```bash
curl -X POST http://localhost:8000/budget/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "trip_name": "Sri Lanka Adventure",
    "total_budget": 5000,
    "food_cost": 1000,
    "transport_cost": 500,
    "hotel_cost": 2000,
    "activities_cost": 1500
  }'
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error Response Example:

```json
{
  "detail": "Invalid email or password"
}
```

## Weather API Integration

To use the weather endpoint, you need to:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to `.env`:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```

### Get Weather

```bash
curl http://localhost:8000/weather/Colombo
```

Response:

```json
{
  "city": "Colombo",
  "temperature": 28.5,
  "feels_like": 30.2,
  "humidity": 75,
  "pressure": 1013,
  "weather_main": "Clouds",
  "weather_description": "overcast clouds",
  "wind_speed": 4.5
}
```

## CORS Configuration

The API is configured to accept requests from:

- `http://localhost:3000` (React development server)
- `http://localhost:5173` (Vite development server)
- All origins in development (\*)

Modify `CORS_ORIGINS` in `app/main.py` for production.

## Development Tips

### Enable Query Logging

Set `echo=True` in `database.py` to see SQL queries in console:

```python
engine = create_engine(DATABASE_URL, echo=True)
```

### Create Dummy Data

You can use the Swagger UI at `/docs` to manually create sample data for testing.

### Testing with Swagger UI

1. Go to `http://localhost:8000/docs`
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Fill in the required fields
5. Click "Execute"

## Performance Considerations

- Connection pooling is configured in `database.py`
- Use `pool_pre_ping=True` to verify connections
- Queries include indexing on frequently searched fields (email, train_name, etc.)
- CORS is optimized for both frontend URLs

## Security Best Practices

1. **Change SECRET_KEY in production**: Use a strong, random key
2. **Use environment variables**: Never hardcode credentials
3. **Enable HTTPS**: Use SSL/TLS in production
4. **Validate input**: Pydantic handles most validation
5. **Implement rate limiting**: Add rate limiting middleware in production
6. **Secure password**: Enforce strong password requirements

## Troubleshooting

### Database Connection Error

```
Error: Can't connect to MySQL server on 'localhost'
```

- Ensure MySQL is running
- Check DATABASE_URL in `.env`
- Verify MySQL username and password

### ModuleNotFoundError: No module named 'app'

- Ensure you're running from the `backend/` directory
- The command should be: `uvicorn app.main:app --reload`

### JWT Token Expired

- Tokens expire after 30 minutes by default
- Login again to get a new token

## Contributing

1. Follow PEP 8 style guide
2. Write descriptive commit messages
3. Test endpoints before submitting

## License

MIT License

## Support

For issues or questions, please create an issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15
