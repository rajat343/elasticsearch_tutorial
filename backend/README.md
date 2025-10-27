# Backend - Node.js Express Server with Prisma

This is a Node.js Express server with Prisma ORM for PostgreSQL database operations.

## Prerequisites

-   Node.js (v16 or higher)
-   PostgreSQL (v12 or higher)
-   npm or yarn

## Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory with:

    ```
    DATABASE_URL="postgresql://postgres:password@localhost:5432/elasticsearch_tutorial"
    PORT=5000
    NODE_ENV=development
    ```

3. **Generate Prisma client:**

    ```bash
    npm run db:generate
    ```

4. **Push database schema:**

    ```bash
    npm run db:push
    ```

5. **Start the server:**
    ```bash
    npm run dev
    ```

The server will automatically create the movies table on startup.

## Insert Movie Data

To insert all movie data from the JSON file:

```bash
npm run data:insert
```

This will insert all 250 movies from `data/movies_data.json`.

## Available Scripts

-   `npm run dev` - Start development server with auto-reload
-   `npm run start` - Start production server
-   `npm run db:generate` - Generate Prisma client
-   `npm run db:push` - Push schema to database
-   `npm run db:studio` - Open Prisma Studio (database GUI)
-   `npm run data:insert` - Insert movie data from JSON
-   `npm run es:index` - Index all movies to Elasticsearch (backfill)

## API Endpoints (Movies)

### Movies

-   `GET /api/movies/search` – **Search movies** (Elasticsearch full-text search)
    -   Query params: `q` (search query), `page` (default: 1), `pageSize` (default: 25)
    -   Searches across: title (boost: 3x), cast (boost: 2x), description (boost: 1.5x)
    -   Example: `/api/movies/search?q=dark+knight&page=1&pageSize=10`
-   `GET /api/movies` – Get all movies (pagination: 25 per page; `?page=2` → 26–50)
-   `GET /api/movies/:id` – Get movie by ID
-   `POST /api/movies` – Create movie (auto-indexes to Elasticsearch)
-   `PUT /api/movies/:id` – Update movie (auto-updates Elasticsearch)
-   `DELETE /api/movies/:id` – Delete movie (auto-removes from Elasticsearch)

### Health Check

-   `GET /health` - Server health status
-   `GET /` - API information

## BigInt serialization

The API serializes BigInt fields (e.g., `budget`, `collection`) to strings in responses to avoid "Do not know how to serialize a BigInt" errors.

## Database Schema (Movies)

The `movies` table includes:

-   `id` (SERIAL PRIMARY KEY) - Auto-generated ID
-   `title` (VARCHAR(500) NOT NULL)
-   `description` (TEXT)
-   `release_date` (DATE)
-   `budget` (BIGINT)
-   `collection` (BIGINT)
-   `cast` (TEXT[]) - Array of cast members
-   `is_hit` (BOOLEAN DEFAULT false)
-   `created_at` (TIMESTAMP WITH TIME ZONE)
-   `updated_at` (TIMESTAMP WITH TIME ZONE)

## Architecture

The application follows a clean architecture pattern:

-   **Controller Layer** (`movie/movie.controller.js`) - HTTP request/response handling
-   **Service Layer** (`movie/movie.service.js`) - Business logic and validation
-   **Repository Layer** (`movie/movie.repository.js`) - Data access and sanitization
-   **Prisma Model** (`prisma/schema.prisma`) - Prisma ORM schema

## Elasticsearch Integration

This backend includes full-text search powered by Elasticsearch.

### Setup Elasticsearch on macOS (Homebrew)

If you installed Elasticsearch via Homebrew, ensure it's running:

```bash
brew services start elastic/tap/elasticsearch-full
# or if using a different installation:
brew services start elasticsearch

# Verify it's running
curl http://localhost:9200
```

### Initial Setup

After starting the server for the first time, the Elasticsearch index will be created automatically. To populate it with existing movies:

```bash
npm run es:index
```

This backfills all movies from PostgreSQL into Elasticsearch.

### How it Works

-   **Auto-sync**: All CRUD operations (create, update, delete) automatically sync with Elasticsearch
-   **Search endpoint**: `GET /api/movies/search?q=your+query`
-   **Index mapping**: Configured with English analyzer and custom field boosts
-   **Fields searched**: title^3, cast^2, description^1.5 (higher boost = more relevance)

### Elasticsearch Configuration

-   **Index name**: `movies` (configurable via `ES_MOVIES_INDEX` env var)
-   **Node URL**: `http://localhost:9200` (configurable via `ES_NODE` env var)
-   **Analyzer**: Custom English analyzer with stopwords

### Example Searches

```bash
# Search for movies with "dark knight" in title/description/cast
curl "http://localhost:5000/api/movies/search?q=dark+knight"

# Search for movies with "streep" in cast
curl "http://localhost:5000/api/movies/search?q=streep&page=1&pageSize=5"

# Search for movies about "survival"
curl "http://localhost:5000/api/movies/search?q=survival"
```

## Prisma Benefits

-   ✅ **Type Safety** - Auto-generated types
-   ✅ **Query Builder** - No raw SQL needed
-   ✅ **Auto Migrations** - Schema changes handled automatically
-   ✅ **Connection Pooling** - Built-in connection management
-   ✅ **IntelliSense** - Full IDE support
-   ✅ **Database Agnostic** - Easy to switch databases

## Development

The app uses:

-   **Prisma** for database operations
-   **Express** for web framework
-   **Nodemon** for auto-restart during development
-   **Environment variables** for configuration

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production `DATABASE_URL`
3. Run `npm run db:push` to sync schema
4. Run `npm start`
