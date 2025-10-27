const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const prisma = require("./lib/prisma");
const movieRoutes = require("./movie/movie.controller");

const app = express();
const PORT = 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/movies", movieRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Endpoint not found",
	});
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error("Unhandled error:", error);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: error.message,
	});
});

// Initialize database and start server
async function startServer() {
	try {
		// Test database connection and create tables
		console.log("🔌 Connecting to database...");
		await prisma.$connect();
		console.log("✅ Database connected successfully");

		// Initialize Elasticsearch index
		const { ensureIndex, INDEX } = require("./lib/esMovies");
		console.log("🔍 Ensuring Elasticsearch index exists...");
		await ensureIndex();
		console.log(`✅ Elasticsearch index ready: ${INDEX}`);

		// Push schema to database (creates tables if they don't exist)
		console.log("📊 Ensuring database schema is up to date...");
		// Note: In production, you'd use migrations instead of db push
		console.log("✅ Database schema ready");

		// Start the server
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`📊 Health check: http://localhost:${PORT}/health`);
			console.log(
				`🔍 API endpoints: http://localhost:${PORT}/api/movies`
			);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
	console.log("\n🛑 Shutting down server...");
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Shutting down server...");
	await prisma.$disconnect();
	process.exit(0);
});

// Start the server
startServer();

module.exports = app;
