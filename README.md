# Elasticsearch Tutorial Project

A full-stack application demonstrating search functionality with Node.js, Express, PostgreSQL, React, and Elasticsearch.

## Project Structure

```
elasticsearch_tutorial/
├── backend/                 # Node.js Express API server
│   ├── config/             # Database configuration
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── scripts/            # Database setup scripts
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/               # React Vite application
│   ├── src/                # React source code
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # This file
```

## Quick Start

### Prerequisites

-   Node.js (v16 or higher)
-   PostgreSQL (v12 or higher)
-   Elasticsearch 7.x (via Homebrew on macOS Apple Silicon)
-   npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

    ```bash
    cd backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up PostgreSQL:**

    - Install PostgreSQL on your system
    - Create a database named `elasticsearch_tutorial`
    - Update database credentials in `config/database.js`

4. **Initialize database:**

    ```bash
    psql -U postgres -f scripts/setup-db.sql
    ```

5. **Start the server:**
    ```bash
    npm run dev
    ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

    ```bash
    cd frontend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the development server:**
    ```bash
    npm run dev
    ```

The frontend will be available at `http://localhost:3000`

## Features

### Backend (Node.js + Express + PostgreSQL + Elasticsearch)

-   ✅ RESTful API with exactly 5 endpoints for Movies
-   ✅ Pagination on GET /api/movies (25 per page, default page=1)
-   ✅ BigInt-safe JSON serialization (budgets/collections)
-   ✅ PostgreSQL database with sample data
-   ✅ Elasticsearch-ready integration path for full-text search
-   ✅ Error handling and validation
-   ✅ CORS enabled for frontend integration
-   ✅ Security headers with Helmet
-   ✅ Request logging with Morgan

### Frontend (React + Vite)

-   ✅ Modern React application with hooks
-   ✅ Real-time search with debouncing
-   ✅ Responsive design for all devices
-   ✅ Beautiful UI with animations
-   ✅ Error handling and loading states
-   ✅ API integration with Axios

## API Endpoints (Movies)

| Method | Endpoint          | Description                                            |
| ------ | ----------------- | ------------------------------------------------------ |
| GET    | `/api/movies`     | Get movies (paginated: 25 per page; `?page=2` → 26–50) |
| GET    | `/api/movies/:id` | Get movie by ID                                        |
| POST   | `/api/movies`     | Create movie                                           |
| PUT    | `/api/movies/:id` | Update movie                                           |
| DELETE | `/api/movies/:id` | Delete movie                                           |

## Database Schema (Movies)

The `movies` table includes:

-   `id` (SERIAL PRIMARY KEY)
-   `title` (VARCHAR)
-   `description` (TEXT)
-   `release_date` (DATE)
-   `budget` (BIGINT)
-   `collection` (BIGINT)
-   `cast` (TEXT[])
-   `is_hit` (BOOLEAN)
-   `created_at` (TIMESTAMP WITH TIME ZONE)
-   `updated_at` (TIMESTAMP WITH TIME ZONE)

Note: BigInt fields are serialized to strings in API responses.

## Sample Data

The database comes pre-populated with 10 sample items including laptops, mice, keyboards, monitors, and other tech products.

## Elasticsearch (macOS Apple Silicon via Homebrew)

Install and run as a system service (preferred):

```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# Set Java for launchd (once per reboot or add to launchd env profile)
sudo launchctl setenv ES_JAVA_HOME /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Dev-friendly config (already applied in backend setup):
# /opt/homebrew/etc/elasticsearch/elasticsearch.yml should contain:
# xpack.security.enabled: false
# xpack.ml.enabled: false
# discovery.type: single-node
# cluster.routing.allocation.disk.threshold_enabled: false

# Start/stop as a system service
sudo brew services start elastic/tap/elasticsearch-full
sudo brew services stop elastic/tap/elasticsearch-full

# Verify
curl -s "http://127.0.0.1:9200" | jq -r '.version.number + " " + .tagline'
curl -s "http://127.0.0.1:9200/_cluster/health?pretty"
```

If you see a node lock error, stop the service and remove the lock:

```bash
sudo brew services stop elastic/tap/elasticsearch-full
sudo rm -f /opt/homebrew/var/lib/elasticsearch/nodes/0/node.lock
sudo brew services start elastic/tap/elasticsearch-full
```

## Development

### Backend Development

-   Uses nodemon for auto-restart during development
-   Environment variables for configuration
-   Structured with models, routes, and configuration
-   Comprehensive error handling

### Frontend Development

-   Vite for fast development and building
-   Hot module replacement for instant updates
-   ESLint for code quality
-   Modern React patterns with hooks

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Configure production database
3. Run `npm start`

### Frontend

1. Run `npm run build`
2. Serve the `dist` folder with a web server
3. Configure API proxy or CORS for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes as part of an Elasticsearch tutorial.
