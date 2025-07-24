# Authentication Endpoints

This section documents all API endpoints related to authentication and authorization.

## Login

`POST /api/auth/login`

Authenticates a user and returns a JWT token.

### Request

```json
{
  "username": "johndoe",
  "password": "password123"
}
```

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

The response includes a `token` cookie that is used for authentication on subsequent requests.

### Error Responses

- **400 Bad Request**: Missing or invalid username/password
- **401 Unauthorized**: Invalid username or password
- **500 Internal Server Error**: Server error

## Register

`POST /api/auth/register`

Registers a new user in the system.

### Request

```json
{
  "username": "newuser",
  "password": "securepassword",
  "full_name": "New User",
  "email": "newuser@example.com"
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

- **400 Bad Request**: Invalid or missing required fields
- **409 Conflict**: Username already exists
- **500 Internal Server Error**: Server error

## Logout

`POST /api/auth/logout`

Logs out the current user by clearing their authentication token.

### Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

The response clears the `token` cookie used for authentication.

### Error Responses

- **500 Internal Server Error**: Server error
