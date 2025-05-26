# Student Budget Buddy API Documentation

## Base URL

```
http://localhost:8000/api for local
https://student-budget-buddy-backend.onrender.com/api for production
```

## Authentication

All endpoints require authentication using Clerk. Include the Clerk session token in the Authorization header.

```
Authorization: Bearer <clerk_session_token>
```

If authentication fails, the API returns:

```json
{
  "success": false,
  "message": "User is not authenticated",
  "statusCode": 401
}
```

## Dashboard API

### Get Dashboard Summary

Returns a summary of the user's financial data for a specified time period.

**Endpoint:** `GET /dashboard/summary`

**Query Parameters:**
- `timePeriod` (optional): Time period for data aggregation. 
  - Values: `day`, `week`, `month`, `year`
  - Default: `month`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIncome": 5000,
    "totalExpenses": 3000,
    "balance": 2000,
    "savingsRate": 40,
    "topExpenseCategories": [
      {
        "category": "Food",
        "amount": 1200
      },
      {
        "category": "Transport",
        "amount": 800
      },
      {
        "category": "Entertainment",
        "amount": 500
      }
    ]
  }
}
```

### Get Spending Trends

Returns spending trends over time for visualization.

**Endpoint:** `GET /dashboard/spending-trends`

**Query Parameters:**
- `timePeriod` (optional): Time granularity for trend data.
  - Values: `daily`, `weekly`, `monthly`, `yearly`
  - Default: `monthly`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "date": "2023-01",
      "amount": 2800
    },
    {
      "date": "2023-02",
      "amount": 3200
    },
    {
      "date": "2023-03",
      "amount": 2900
    }
  ]
}
```

### Get Spending By Category

Returns spending breakdown by categories for the specified time period.

**Endpoint:** `GET /dashboard/spending-by-category`

**Query Parameters:**
- `timePeriod` (optional): Time period for data aggregation.
  - Values: `day`, `week`, `month`, `year`
  - Default: `month`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "amount": 1200,
      "percentage": 40
    },
    {
      "category": "Transport",
      "amount": 800,
      "percentage": 26.7
    },
    {
      "category": "Entertainment",
      "amount": 500,
      "percentage": 16.7
    },
    {
      "category": "Other",
      "amount": 500,
      "percentage": 16.7
    }
  ]
}
```

### Get Upcoming Financial Events

Returns a list of upcoming financial events for the authenticated user.

**Endpoint:** `GET /dashboard/financial-events/upcoming`

**Query Parameters:**
- `limit` (optional): Maximum number of events to return.
  - Default: `5`
- `daysAhead` (optional): How many days in the future to look for events.
  - Default: `30`
- `isActive` (optional): Whether to return only active events.
  - Values: `true`, `false`
  - Default: `true`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Rent Payment",
      "amount": 1200,
      "nextDueDate": "2023-06-01T00:00:00.000Z",
      "recurrenceType": "MONTHLY",
      "isActive": true,
      "currency": {
        "code": "USD",
        "symbol": "$"
      },
      "budgetCategory": {
        "id": "abc123",
        "name": "Housing"
      }
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Internet Bill",
      "amount": 75,
      "nextDueDate": "2023-06-05T00:00:00.000Z",
      "recurrenceType": "MONTHLY",
      "isActive": true,
      "currency": {
        "code": "USD",
        "symbol": "$"
      },
      "budgetCategory": {
        "id": "def456",
        "name": "Utilities"
      }
    }
  ]
}
```

## Insight API

### Get Budget Insights

Provides detailed insights and analysis for a specific budget.

**Endpoint:** `GET /insight/budget/:budgetId`

**Path Parameters:**
- `budgetId`: ID of the budget to analyze

**Response:**

```json
{
  "success": true,
  "data": {
    "budgetId": "123e4567-e89b-12d3-a456-426614174000",
    "budgetName": "Monthly Budget",
    "totalBudget": 3500,
    "totalSpent": 3000,
    "remainingBudget": 500,
    "spendingRate": 85.7,
    "projectedOverspend": false,
    "daysRemaining": 7,
    "categoryBreakdown": [
      {
        "category": "Food",
        "budgeted": 1200,
        "spent": 1100,
        "remaining": 100,
        "percentage": 91.7
      },
      {
        "category": "Transport",
        "budgeted": 800,
        "spent": 750,
        "remaining": 50,
        "percentage": 93.8
      }
    ],
    "recommendations": [
      "You're on track with your Food budget",
      "Consider reducing Transportation expenses to stay within budget"
    ]
  }
}
```

### Get Spending Summary

Provides a summary of spending for a specified date range.

**Endpoint:** `GET /insight/spending-summary/`

**Query Parameters:**
- `startDate` (optional): Start date for spending summary (YYYY-MM-DD)
- `endDate` (optional): End date for spending summary (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSpent": 3000,
    "averageDailySpend": 100,
    "highestSpendDay": {
      "date": "2023-05-15",
      "amount": 250
    },
    "lowestSpendDay": {
      "date": "2023-05-03",
      "amount": 25
    },
    "topMerchants": [
      {
        "name": "Grocery Store A",
        "amount": 450
      },
      {
        "name": "Restaurant B",
        "amount": 320
      }
    ],
    "unusualSpending": [
      {
        "date": "2023-05-15",
        "amount": 250,
        "merchant": "Electronics Store",
        "category": "Shopping"
      }
    ]
  }
}
```

## Error Responses

The API uses standard HTTP status codes and returns error details in a consistent format:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid time period specified",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "User is not authenticated",
  "statusCode": 401
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Budget not found",
  "statusCode": 404
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

## CORS Support

The API supports CORS for the following origins:
- http://localhost:3000 (Development frontend)
- https://student-bugdet-buddy-lyje.vercel.app (Production frontend)
