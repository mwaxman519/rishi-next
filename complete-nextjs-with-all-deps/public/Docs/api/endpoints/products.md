# Product Endpoints

## Get Products

`GET /api/products`

Retrieves a list of all products in the system.

### Response

```json
[
  {
    "id": 1,
    "name": "Product A",
    "price": 19.99
  },
  {
    "id": 2,
    "name": "Product B",
    "price": 29.99
  }
]
```

## Get Product

`GET /api/products/:id`

Retrieves a specific product by ID.

### Response

```json
{
  "id": 1,
  "name": "Product A",
  "price": 19.99
}
```
