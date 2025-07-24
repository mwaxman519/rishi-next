#!/bin/bash

# Test all endpoints after WebSocket fixes
echo "Testing all endpoints after WebSocket fixes..."

# Login first
curl -X POST http://localhost:5000/api/auth-service/login \
  -H "Content-Type: application/json" \
  -d '{"username": "mike", "password": "wrench519"}' \
  -c cookies.txt -s > /dev/null

# Test endpoints
echo "Testing /api/organizations:"
curl -X GET http://localhost:5000/api/organizations \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/locations:"
curl -X GET http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/activities:"
curl -X GET http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/bookings:"
curl -X GET http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/users:"
curl -X GET http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/events:"
curl -X GET http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq 'length'

echo "Testing /api/auth-service/user:"
curl -X GET http://localhost:5000/api/auth-service/user \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq '.id'

echo "Testing /api/auth-service/session:"
curl -X GET http://localhost:5000/api/auth-service/session \
  -H "Content-Type: application/json" \
  -b cookies.txt -s | jq '.userId'

echo "All endpoint tests completed!"
