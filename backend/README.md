# Agricult Backend API

Backend server for the Agricult application, designed to support farmers with limited connectivity.

## Features

### 1. Authentication & User Management
- User registration with farming-specific data
- Authentication with JWT tokens
- Password reset functionality
- User profile management
- Location updates

### 2. Weather API
- Current weather data
- Weather forecasts
- Location-specific weather
- Weather alerts for farming regions

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Weather API key (from weatherapi.com)

### Installation

1. Clone the repository
2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
BASE_URL = https://interrospot.vercel.app
MONGODB_URI = <your-mongodb-connection-string>
JWT_SECRET = <your-jwt-secret>
PORT = 4000
WEATHER_API_KEY = <your-weather-api-key>

MAIL_HOST = smtp.gmail.com
MAIL_USER = <your-email>
MAIL_PASS = <your-email-password>
```

4. Start the server
```
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication & User Management
- `POST /api/auth/register` - Register new user with farming-specific data
- `POST /api/auth/login` - Authenticate users
- `POST /api/auth/refresh-token` - Refresh authentication token
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password/:resetToken` - Reset user password
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/location` - Update user's current location

### Weather APIs
- `GET /api/weather/current` - Get current weather data
- `GET /api/weather/forecast` - Get weather forecast
- `GET /api/weather/location/:locationId` - Get weather for specific location
- `GET /api/weather/alerts` - Get weather alerts for user's region

## Authentication

All API endpoints except for authentication endpoints require a JWT token. Pass the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
``` 