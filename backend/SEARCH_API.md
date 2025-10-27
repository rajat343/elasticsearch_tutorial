# Movie Search API - Quick Reference

## Search Endpoint

```
GET /api/movies/search
```

### Query Parameters

| Parameter  | Type   | Default | Description                                      |
| ---------- | ------ | ------- | ------------------------------------------------ |
| `q`        | string | `""`    | Search query (searches title, description, cast) |
| `page`     | number | `1`     | Page number (1-indexed)                          |
| `pageSize` | number | `25`    | Number of results per page                       |

### Response Format

```json
{
	"success": true,
	"data": [
		{
			"id": 123,
			"title": "The Dark Knight",
			"description": "...",
			"releaseDate": "2008-07-18T00:00:00.000Z",
			"budget": "185000000",
			"collection": "1004558444",
			"cast": ["Christian Bale", "Heath Ledger"],
			"isHit": true,
			"score": 24.45787,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"count": 1,
	"page": 1,
	"pageSize": 25
}
```

## Search Examples

### 1. Search by Movie Title

```bash
curl "http://localhost:5000/api/movies/search?q=dark+knight"
```

**Response:**

-   Finds movies with "dark" and "knight" in title (highest relevance)
-   Title matches get 3x boost in relevance score

### 2. Search by Actor/Cast

```bash
curl "http://localhost:5000/api/movies/search?q=meryl+streep"
```

**Response:**

-   Finds movies with "Meryl Streep" in the cast array
-   Cast matches get 2x boost in relevance score

### 3. Search by Description Keywords

```bash
curl "http://localhost:5000/api/movies/search?q=survival"
```

**Response:**

-   Finds movies with "survival" in the description
-   Description matches get 1.5x boost in relevance score

### 4. Multi-word Search

```bash
curl "http://localhost:5000/api/movies/search?q=action+adventure"
```

**Response:**

-   Searches for documents containing "action" OR "adventure"
-   Documents with both words score higher

### 5. Paginated Search

```bash
# First page (results 1-10)
curl "http://localhost:5000/api/movies/search?q=streep&page=1&pageSize=10"

# Second page (results 11-20)
curl "http://localhost:5000/api/movies/search?q=streep&page=2&pageSize=10"
```

### 6. Get All Movies (No Query)

```bash
curl "http://localhost:5000/api/movies/search?page=1&pageSize=25"
```

**Response:**

-   Returns all movies when `q` is empty or omitted
-   Paginated results

## Search Behavior

### Field Weights (Relevance Boost)

The search uses a `multi_match` query with custom boosts:

```javascript
{
	fields: [
		"title^3", // Title: 3x boost (highest priority)
		"cast^2", // Cast: 2x boost
		"description^1.5", // Description: 1.5x boost
	];
}
```

This means:

-   A match in the **title** is 3x more relevant than a match in the description
-   A match in the **cast** is 2x more relevant than a match in the description

### Analyzer

Uses a custom English analyzer (`english_custom`) that:

-   Removes common English stopwords ("the", "a", "an", "is", etc.)
-   Uses standard tokenization
-   Case-insensitive matching

### Scoring

Each result includes a `score` field indicating relevance:

-   **Higher score** = more relevant match
-   Scores depend on:
    -   Which field matched (title > cast > description)
    -   Term frequency (how many times the search term appears)
    -   Document frequency (how rare the search term is across all documents)

## Frontend Integration

### Using fetch

```javascript
async function searchMovies(query, page = 1, pageSize = 25) {
	const params = new URLSearchParams({ q: query, page, pageSize });
	const response = await fetch(`/api/movies/search?${params}`);
	const data = await response.json();
	return data;
}

// Usage
const results = await searchMovies("inception");
console.log(results.data); // Array of movies
console.log(results.total); // Total number of matches
```

### Using axios (already in your project)

```javascript
import { searchMovies } from "./services/api";

// The function is already defined in frontend/src/services/api.js
const results = await searchMovies("dark knight");
```

## Error Handling

### Success Response

```json
{
  "success": true,
  "data": [...],
  "total": 10,
  "count": 10,
  "page": 1,
  "pageSize": 25
}
```

### Error Response

```json
{
	"success": false,
	"message": "Error searching movies",
	"error": "Elasticsearch connection failed"
}
```

**HTTP Status Codes:**

-   `200` - Success
-   `500` - Server error (Elasticsearch down, connection failed, etc.)

## Performance Notes

1. **First search might be slower** - Elasticsearch needs to "warm up" caches
2. **Subsequent searches are fast** - Typically < 50ms
3. **Pagination is efficient** - Uses Elasticsearch's `from` and `size` parameters
4. **Auto-refresh** - New/updated movies are searchable immediately (using `refresh: "wait_for"`)

## Maintenance Commands

### Re-index All Movies

```bash
npm run es:index
```

Use this when:

-   Setting up for the first time
-   After changing Elasticsearch mappings
-   After bulk importing movies to PostgreSQL

### Check Elasticsearch Status

```bash
curl http://localhost:9200/_cluster/health?pretty
```

### Check Index Stats

```bash
curl http://localhost:9200/movies/_stats?pretty
```

### View Index Mapping

```bash
curl http://localhost:9200/movies/_mapping?pretty
```

### Count Documents in Index

```bash
curl http://localhost:9200/movies/_count?pretty
```

## Tips for Best Results

1. **Use specific terms** - "inception" better than "movie about dreams"
2. **Search by actor names** - Works well with cast field: "tom hanks"
3. **Use multiple keywords** - "superhero gotham" to find Batman movies
4. **Case doesn't matter** - "INCEPTION" and "inception" return same results
5. **Partial words don't work** - Search "incep" won't find "Inception" (unless you add n-gram analyzers)

## Next Steps

Consider adding:

-   **Filters** - Filter by year, budget range, hit status
-   **Sorting** - Sort by release date, budget, collection
-   **Aggregations** - Get counts by year, genre, etc.
-   **Suggestions** - Auto-complete as user types
-   **Fuzzy matching** - Handle typos ("inkeption" → "inception")
-   **Highlighting** - Show which parts of the text matched

All of these are possible with Elasticsearch!
