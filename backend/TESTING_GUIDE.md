# API Testing Guide - TravelHarbor Hub

This guide provides examples for testing all API endpoints using cURL, Postman, or Swagger UI.

## Prerequisites

- Backend running at `http://localhost:8000`
- cURL installed (or Postman app)

## Test Data Note

After running `python seed_data.py`, use:

- **Email:** john@example.com
- **Password:** password123

## Authentication Tests

### Test 1: Register a New User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected Response (201):**

```json
{
  "id": 2,
  "name": "Test User",
  "email": "test@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**

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

**Save the token:**

```bash
TOKEN="your_access_token_here"
```

### Test 3: Get Current User Profile

```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Trains API Tests

### Test 4: Get All Trains (No Auth Required)

```bash
curl -X GET http://localhost:8000/trains \
  -H "Content-Type: application/json"
```

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "train_name": "Express 101",
    "departure_station": "Colombo Central",
    "arrival_station": "Kandy Junction",
    "departure_time": "2024-01-16T08:00:00",
    "arrival_time": "2024-01-16T12:00:00",
    "price": 2500,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### Test 5: Get Specific Train

```bash
curl -X GET http://localhost:8000/trains/1 \
  -H "Content-Type: application/json"
```

### Test 6: Book a Train (Auth Required)

```bash
curl -X POST http://localhost:8000/trains/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "train_id": 1
  }'
```

**Expected Response (201):**

```json
{
  "id": 1,
  "user_id": 1,
  "train_id": 1,
  "booking_date": "2024-01-15T10:30:00",
  "status": "booked",
  "created_at": "2024-01-15T10:30:00"
}
```

### Test 7: Get User Train Bookings

```bash
curl -X GET http://localhost:8000/trains/bookings/user \
  -H "Authorization: Bearer $TOKEN"
```

### Test 8: Cancel Train Booking

```bash
curl -X DELETE http://localhost:8000/trains/cancel/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "Train booking cancelled successfully"
}
```

---

## Hotels API Tests

### Test 9: Get All Hotels

```bash
curl -X GET http://localhost:8000/hotels \
  -H "Content-Type: application/json"
```

### Test 10: Book a Hotel

```bash
curl -X POST http://localhost:8000/hotels/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": 1,
    "check_in": "2024-02-01T14:00:00",
    "check_out": "2024-02-05T11:00:00"
  }'
```

### Test 11: Get User Hotel Bookings

```bash
curl -X GET http://localhost:8000/hotels/bookings/user \
  -H "Authorization: Bearer $TOKEN"
```

### Test 12: Cancel Hotel Booking

```bash
curl -X DELETE http://localhost:8000/hotels/cancel/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Packages API Tests

### Test 13: Get All Packages

```bash
curl -X GET http://localhost:8000/packages
```

### Test 14: Get Specific Package

```bash
curl -X GET http://localhost:8000/packages/1
```

### Test 15: Book a Package

```bash
curl -X POST http://localhost:8000/packages/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": 1,
    "start_date": "2024-02-15T08:00:00"
  }'
```

### Test 16: Get User Package Bookings

```bash
curl -X GET http://localhost:8000/packages/bookings/user \
  -H "Authorization: Bearer $TOKEN"
```

### Test 17: Cancel Package Booking

```bash
curl -X DELETE http://localhost:8000/packages/cancel/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Places API Tests

### Test 18: Get All Places

```bash
curl -X GET http://localhost:8000/places
```

### Test 19: Get Specific Place

```bash
curl -X GET http://localhost:8000/places/1
```

### Test 20: Get Places by District

```bash
curl -X GET http://localhost:8000/places/district/Kandy
```

---

## Budget API Tests

### Test 21: Create Budget

```bash
curl -X POST http://localhost:8000/budget/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_name": "Sri Lanka Adventure",
    "total_budget": 5000,
    "food_cost": 1000,
    "transport_cost": 500,
    "hotel_cost": 2000,
    "activities_cost": 1500
  }'
```

**Expected Response (201):**

```json
{
  "id": 1,
  "user_id": 1,
  "trip_name": "Sri Lanka Adventure",
  "total_budget": 5000,
  "food_cost": 1000,
  "transport_cost": 500,
  "hotel_cost": 2000,
  "activities_cost": 1500,
  "created_at": "2024-01-15T10:30:00"
}
```

### Test 22: Get User Budgets

```bash
curl -X GET http://localhost:8000/budget/user \
  -H "Authorization: Bearer $TOKEN"
```

### Test 23: Get Specific Budget

```bash
curl -X GET http://localhost:8000/budget/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Test 24: Update Budget

```bash
curl -X PUT http://localhost:8000/budget/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "food_cost": 1200,
    "transport_cost": 600
  }'
```

### Test 25: Delete Budget

```bash
curl -X DELETE http://localhost:8000/budget/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Weather API Tests

### Test 26: Get Weather

```bash
curl -X GET "http://localhost:8000/weather/Colombo"
```

**Note:** This requires a valid OpenWeatherMap API key in `.env`

**Expected Response (200):**

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

---

## Error Handling Tests

### Test Invalid Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }'
```

**Expected Response (401):**

```json
{
  "detail": "Invalid email or password"
}
```

### Test Missing Auth Token

```bash
curl -X GET http://localhost:8000/trains/bookings/user
```

**Expected Response (401):**

```json
{
  "detail": "Not authenticated. Use Authorization: Bearer <token>"
}
```

### Test Expired/Invalid Token

```bash
curl -X GET http://localhost:8000/trains/bookings/user \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response (401):**

```json
{
  "detail": "Invalid or expired token"
}
```

### Test Invalid Hotel Dates

```bash
curl -X POST http://localhost:8000/hotels/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": 1,
    "check_in": "2024-02-05T14:00:00",
    "check_out": "2024-02-01T11:00:00"
  }'
```

**Expected Response (400):**

```json
{
  "detail": "Check-in date must be before check-out date"
}
```

### Test Non-Existent Resource

```bash
curl -X GET http://localhost:8000/trains/99999
```

**Expected Response (404):**

```json
{
  "detail": "Train not found"
}
```

---

## Testing with Postman

1. Import the endpoints into Postman
2. Set up environment variable `{{base_url}} = http://localhost:8000`
3. Set up `{{token}}` variable for storing JWT token
4. In login response, use "Tests" tab to automatically save token:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.access_token);
   ```

---

## Testing with Swagger UI

1. Visit http://localhost:8000/docs
2. Click "Authorize" button
3. Paste token in the value field (without "Bearer " prefix)
4. Click "Authorize" and "Close"
5. Now you can test any protected endpoint directly

---

## Quick Test Script (Bash)

Save this as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing TravelHarbor Hub API..."

# Test 1: Health Check
echo -e "\n${GREEN}Test 1: Health Check${NC}"
curl -s $BASE_URL/health | jq .

# Test 2: Register
echo -e "\n${GREEN}Test 2: Register User${NC}"
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123"
  }')
echo $REGISTER | jq .

# Test 3: Login
echo -e "\n${GREEN}Test 3: Login${NC}"
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }')
echo $LOGIN | jq .

TOKEN=$(echo $LOGIN | jq -r '.access_token')

# Test 4: Get Trains
echo -e "\n${GREEN}Test 4: Get Trains${NC}"
curl -s -X GET $BASE_URL/trains | jq .

# Test 5: Get Hotels
echo -e "\n${GREEN}Test 5: Get Hotels${NC}"
curl -s -X GET $BASE_URL/hotels | jq .

# Test 6: Book Train (with token)
echo -e "\n${GREEN}Test 6: Book Train${NC}"
curl -s -X POST $BASE_URL/trains/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"train_id": 1}' | jq .

echo -e "\n${GREEN}API Testing Complete!${NC}"
```

Run with:

```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Performance Testing Tips

1. Use Apache Bench:

```bash
ab -n 100 -c 10 http://localhost:8000/trains
```

2. Use `wrk`:

```bash
wrk -t4 -c100 -d30s http://localhost:8000/trains
```

3. Monitor database queries with `echo=True` in `database.py`

---

For more information, see [README.md](README.md) and [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
