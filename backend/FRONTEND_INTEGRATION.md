# Frontend Integration Guide - TravelHarbor Hub API

This guide explains how to integrate the React frontend with the TravelHarbor Hub FastAPI backend.

## Backend API Base URL

```
http://localhost:8000
```

## Authentication

### Register a User

**Endpoint:** `POST /auth/register`

```javascript
// Request
const response = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword123'
  })
});

const user = await response.json();

// Response
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

### Login

**Endpoint:** `POST /auth/login`

```javascript
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();

// Response
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

// Store token in localStorage
localStorage.setItem('token', data.access_token);
```

### Get Current User

**Endpoint:** `GET /auth/me`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/auth/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const user = await response.json();
```

## Protected Requests

All protected endpoints require the JWT token in the Authorization header:

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/trains/", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## Trains API

### Get All Trains

**Endpoint:** `GET /trains`

```javascript
const response = await fetch("http://localhost:8000/trains", {
  headers: {
    "Content-Type": "application/json",
  },
});

const trains = await response.json();

// Response
[
  {
    id: 1,
    train_name: "Express 101",
    departure_station: "Colombo Central",
    arrival_station: "Kandy Junction",
    departure_time: "2024-01-16T08:00:00",
    arrival_time: "2024-01-16T12:00:00",
    price: 2500,
    created_at: "2024-01-15T10:30:00",
  },
];
```

### Book a Train

**Endpoint:** `POST /trains/book`

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8000/trains/book', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    train_id: 1
  })
});

const booking = await response.json();

// Response
{
  "id": 1,
  "user_id": 1,
  "train_id": 1,
  "booking_date": "2024-01-15T10:30:00",
  "status": "booked",
  "created_at": "2024-01-15T10:30:00"
}
```

### Get User Train Bookings

**Endpoint:** `GET /trains/bookings/user`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/trains/bookings/user", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const bookings = await response.json();
```

### Cancel Train Booking

**Endpoint:** `DELETE /trains/cancel/{booking_id}`

```javascript
const token = localStorage.getItem("token");
const bookingId = 1;

const response = await fetch(
  `http://localhost:8000/trains/cancel/${bookingId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const result = await response.json();
// Response: { "message": "Train booking cancelled successfully" }
```

## Hotels API

### Get All Hotels

**Endpoint:** `GET /hotels`

```javascript
const response = await fetch("http://localhost:8000/hotels");
const hotels = await response.json();
```

### Book a Hotel

**Endpoint:** `POST /hotels/book`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/hotels/book", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    hotel_id: 1,
    check_in: "2024-02-01T14:00:00",
    check_out: "2024-02-05T11:00:00",
  }),
});

const booking = await response.json();
```

### Get User Hotel Bookings

**Endpoint:** `GET /hotels/bookings/user`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/hotels/bookings/user", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const bookings = await response.json();
```

### Cancel Hotel Booking

**Endpoint:** `DELETE /hotels/cancel/{booking_id}`

```javascript
const token = localStorage.getItem("token");

const response = await fetch(
  `http://localhost:8000/hotels/cancel/${bookingId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

## Packages API

### Get All Packages

**Endpoint:** `GET /packages`

```javascript
const response = await fetch("http://localhost:8000/packages");
const packages = await response.json();
```

### Book a Package

**Endpoint:** `POST /packages/book`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/packages/book", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    package_id: 1,
    start_date: "2024-02-01T08:00:00",
  }),
});

const booking = await response.json();
```

### Get User Package Bookings

**Endpoint:** `GET /packages/bookings/user`

```javascript
const response = await fetch("http://localhost:8000/packages/bookings/user", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const bookings = await response.json();
```

### Cancel Package Booking

**Endpoint:** `DELETE /packages/cancel/{booking_id}`

## Places API

### Get All Places

**Endpoint:** `GET /places`

```javascript
const response = await fetch("http://localhost:8000/places");
const places = await response.json();

// Response
[
  {
    id: 1,
    name: "Sigiriya Rock Fortress",
    district: "Matale",
    description: "Ancient rock fortress with historical significance...",
    image_url: "https://example.com/sigiriya.jpg",
    created_at: "2024-01-15T10:30:00",
  },
];
```

### Get Place by District

**Endpoint:** `GET /places/district/{district}`

```javascript
const response = await fetch("http://localhost:8000/places/district/Kandy");
const places = await response.json();
```

## Budget API

### Create Budget

**Endpoint:** `POST /budget/create`

```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/budget/create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    trip_name: "Sri Lanka Adventure",
    total_budget: 5000,
    food_cost: 1000,
    transport_cost: 500,
    hotel_cost: 2000,
    activities_cost: 1500,
  }),
});

const budget = await response.json();
```

### Get User Budgets

**Endpoint:** `GET /budget/user`

```javascript
const response = await fetch("http://localhost:8000/budget/user", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const budgets = await response.json();
```

### Get Specific Budget

**Endpoint:** `GET /budget/{budget_id}`

### Update Budget

**Endpoint:** `PUT /budget/{budget_id}`

```javascript
const response = await fetch(`http://localhost:8000/budget/${budgetId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    food_cost: 1200,
    transport_cost: 600,
  }),
});

const updatedBudget = await response.json();
```

### Delete Budget

**Endpoint:** `DELETE /budget/{budget_id}`

```javascript
const response = await fetch(`http://localhost:8000/budget/${budgetId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Weather API

### Get Weather

**Endpoint:** `GET /weather/{city}`

```javascript
const response = await fetch('http://localhost:8000/weather/Colombo');
const weather = await response.json();

// Response
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

## Error Handling

All endpoints return appropriate HTTP status codes:

```javascript
const response = await fetch("http://localhost:8000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@example.com", password: "wrong" }),
});

if (!response.ok) {
  const error = await response.json();
  console.error(error.detail); // "Invalid email or password"
}
```

Common status codes:

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## React Integration Example

### Using with Fetch API

```javascript
// services/api.js
const API_BASE_URL = "http://localhost:8000";

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "An error occurred");
  }

  return response.json();
};

// Usage in component
import { apiCall } from "./services/api";

async function getTrains() {
  try {
    const trains = await apiCall("/trains");
    console.log(trains);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
```

### Using with Axios

```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Usage
import api from "./services/api";

async function bookTrain() {
  try {
    const booking = await api.post("/trains/book", { train_id: 1 });
    console.log(booking.data);
  } catch (error) {
    console.error("Error:", error.response.data.detail);
  }
}
```

## CORS Configuration

The backend is configured to accept requests from:

- `http://localhost:3000` (Create React App default)
- `http://localhost:5173` (Vite default)

If your frontend runs on a different port, update the CORS settings in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:YOUR_PORT"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### CORS Error

If you get a CORS error:

1. Check that the backend is running on `localhost:8000`
2. Verify the frontend URL is in the CORS_ORIGINS list
3. Check that requests have correct Content-Type header

### 401 Unauthorized

- Token may have expired (valid for 30 minutes)
- Re-login to get a new token
- Check that token is properly stored and sent in Authorization header

### 404 Not Found

- Resource doesn't exist
- Check the resource ID is correct
- Verify you're making the request to the right endpoint

---

For more details, see the main [README.md](README.md) and API documentation at `http://localhost:8000/docs`
