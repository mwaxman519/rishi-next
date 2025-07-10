# Documentation API Endpoints

This section documents all API endpoints related to documentation management.

## Get Document Tree

`GET /api/docs/tree`

Retrieves the entire document structure as a tree, mirroring the actual file structure in the Docs directory.

### Response

```json
{
  "api": {
    "endpoints": {
      "README.md": null,
      "users.md": null,
      "items.md": null,
      "auth.md": null,
      "availability.md": null,
      "docs.md": null,
      "status.md": null,
      "healthcheck.md": null
    }
  },
  "architecture": {
    "overview.md": null,
    "components.md": null
  },
  "getting-started": {
    "installation.md": null,
    "configuration.md": null
  }
}
```

The tree structure follows these rules:

- Directories are represented as nested objects
- Files are represented as keys with null values
- Directories are sorted alphabetically first
- Files are sorted alphabetically after directories
- README files always appear first in their directory

## Get Document Content

`GET /api/docs/content`

Retrieves the content of a specific document file.

### Query Parameters

- `path` (required): The path to the document, relative to the Docs directory

### Example

`GET /api/docs/content?path=api/endpoints/users.md`

### Response

```json
{
  "content": "# User Endpoints\n\nThis section documents all API endpoints related to user management...",
  "metadata": {
    "title": "User Endpoints",
    "lastModified": "2025-03-31T12:34:56.789Z"
  }
}
```

## Search Documents

`GET /api/docs/search`

Searches for documents containing the specified query text.

### Query Parameters

- `q` (required): The search query string

### Example

`GET /api/docs/search?q=authentication`

### Response

```json
{
  "results": [
    {
      "path": "api/endpoints/auth.md",
      "title": "Authentication Endpoints",
      "snippet": "...This section documents all API endpoints related to authentication and authorization...",
      "relevance": 0.95
    },
    {
      "path": "architecture/security.md",
      "title": "Security Architecture",
      "snippet": "...The authentication flow follows industry standard OAuth2 protocols...",
      "relevance": 0.78
    }
  ]
}
```

## Get Recent Documents

`GET /api/docs/recent`

Retrieves a list of recently updated documentation files.

### Query Parameters

- `limit` (optional): Maximum number of documents to return (default: 10)

### Response

```json
{
  "recent": [
    {
      "path": "api/endpoints/availability.md",
      "title": "Availability Endpoints",
      "lastModified": "2025-03-31T15:45:30.000Z"
    },
    {
      "path": "api/endpoints/docs.md",
      "title": "Documentation API Endpoints",
      "lastModified": "2025-03-31T14:22:10.000Z"
    },
    {
      "path": "getting-started/installation.md",
      "title": "Installation Guide",
      "lastModified": "2025-03-30T09:15:45.000Z"
    }
  ]
}
```

## Get Document Tags

`GET /api/docs/tags`

Retrieves all tags used across documentation files and their usage counts.

### Response

```json
{
  "tags": [
    {
      "name": "api",
      "count": 15
    },
    {
      "name": "guide",
      "count": 8
    },
    {
      "name": "authentication",
      "count": 5
    },
    {
      "name": "advanced",
      "count": 3
    }
  ]
}
```
