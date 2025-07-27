# User Endpoints

This section documents all API endpoints related to user management.

## Get All Users

`GET /api/users`

Retrieves a list of all users in the system.

### Response

```json
[
  {
    "id": 1,
    "username": "johndoe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_image": null,
    "phone": null
  },
  {
    "id": 2,
    "username": "janesmith",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin",
    "profile_image": null,
    "phone": null
  }
]
```

## Create User

`POST /api/users`

Creates a new user in the system.

### Request

```json
{
  "username": "newuser",
  "password": "securepassword",
  "full_name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "profile_image": null,
  "phone": null
}
```

### Response

```json
{
  "id": 3,
  "username": "newuser",
  "full_name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "profile_image": null,
  "phone": null
}
```

### Error Responses

- **400 Bad Request**: Request payload doesn't match schema
- **409 Conflict**: Username already exists
- **500 Internal Server Error**: Server or database error

## Get User by ID

`GET /api/users/:id`

Retrieves a specific user by ID.

### Response

```json
{
  "id": 1,
  "username": "johndoe",
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "profile_image": null,
  "phone": null
}
```

### Error Responses

- **400 Bad Request**: Invalid user ID
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server or database error

## Update User

`PUT /api/users/:id`

Updates an existing user.

### Request

```json
{
  "full_name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

### Response

```json
{
  "id": 1,
  "username": "johndoe",
  "full_name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "user",
  "profile_image": null,
  "phone": null
}
```

### Error Responses

- **400 Bad Request**: Invalid user ID
- **404 Not Found**: User not found
- **409 Conflict**: If updating username to one that already exists
- **500 Internal Server Error**: Server or database error

## Delete User

`DELETE /api/users/:id`

Deletes a user from the system.

### Response

```json
{
  "message": "User deleted successfully"
}
```

### Error Responses

- **400 Bad Request**: Invalid user ID
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server or database error
