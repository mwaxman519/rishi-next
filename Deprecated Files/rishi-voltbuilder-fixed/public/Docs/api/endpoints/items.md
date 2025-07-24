# Item Endpoints

This section documents all API endpoints related to item management.

## Get All Items

`GET /api/items`

Retrieves a list of all items in the system.

### Response

```json
[
  {
    "id": 1,
    "name": "Item 1",
    "description": "This is the first item",
    "price": 19.99,
    "category": "electronics"
  },
  {
    "id": 2,
    "name": "Item 2",
    "description": "This is the second item",
    "price": 29.99,
    "category": "furniture"
  }
]
```

## Create Item

`POST /api/items`

Creates a new item in the system.

### Request

```json
{
  "name": "New Item",
  "description": "This is a new item",
  "price": 39.99,
  "category": "clothing"
}
```

### Response

```json
{
  "id": 3,
  "name": "New Item",
  "description": "This is a new item",
  "price": 39.99,
  "category": "clothing"
}
```

### Error Responses

- **400 Bad Request**: Request payload doesn't match schema
- **500 Internal Server Error**: Server or database error

## Get Item by ID

`GET /api/items/:id`

Retrieves a specific item by ID.

### Response

```json
{
  "id": 1,
  "name": "Item 1",
  "description": "This is the first item",
  "price": 19.99,
  "category": "electronics"
}
```

### Error Responses

- **400 Bad Request**: Invalid item ID
- **404 Not Found**: Item not found
- **500 Internal Server Error**: Server or database error

## Update Item

`PUT /api/items/:id`

Updates an existing item.

### Request

```json
{
  "name": "Updated Item 1",
  "price": 24.99
}
```

### Response

```json
{
  "id": 1,
  "name": "Updated Item 1",
  "description": "This is the first item",
  "price": 24.99,
  "category": "electronics"
}
```

### Error Responses

- **400 Bad Request**: Invalid item ID
- **404 Not Found**: Item not found
- **500 Internal Server Error**: Server or database error

## Delete Item

`DELETE /api/items/:id`

Deletes an item from the system.

### Response

```json
{
  "message": "Item deleted successfully"
}
```

### Error Responses

- **400 Bad Request**: Invalid item ID
- **404 Not Found**: Item not found
- **500 Internal Server Error**: Server or database error
