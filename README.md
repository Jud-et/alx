# ALX Express.js REST API

A simple Express.js REST API with items management endpoints.

## Features

- **GET /items** - Retrieve all items
- **POST /items** - Create a new item
- **GET /health** - Health check endpoint
- In-memory storage
- Security middleware (Helmet)
- CORS enabled
- JSON body parsing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### GET /items
Returns a list of all items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sample Item 1",
      "description": "This is a sample item"
    }
  ],
  "count": 1
}
```

### POST /items
Creates a new item.

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Item description (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 2,
    "name": "New Item",
    "description": "Item description"
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Server

The server runs on port 3000 by default.
Access the API at: `http://localhost:3000`

## Testing

You can test the API using curl:

```bash
# Get all items
curl http://localhost:3000/items

# Create a new item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "A test item"}'

# Health check
curl http://localhost:3000/health
```
