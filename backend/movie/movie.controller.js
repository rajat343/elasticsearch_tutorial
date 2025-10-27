const express = require("express");
const router = express.Router();
const movieService = require("./movie.service");

// GET /api/movies/search - Search movies using Elasticsearch
router.get("/search", async (req, res) => {
	try {
		const q = (req.query.q || "").toString();
		const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
		const pageSize =
			Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : 25;

		const { searchMovies } = require("../lib/esMovies");
		const { results, total } = await searchMovies({ q, page, pageSize });

		res.json({
			success: true,
			data: results,
			total,
			count: results.length,
			page,
			pageSize,
		});
	} catch (error) {
		console.error("Error searching movies:", error);
		res.status(500).json({
			success: false,
			message: "Error searching movies",
			error: error.message,
		});
	}
});

// GET /api/movies - Get all movies with pagination (default page=1, size=25)
router.get("/", async (req, res) => {
	try {
		const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
		const size = 25; // fixed per requirements
		const filters = { ...req.query };
		delete filters.page;

		const movies = await movieService.getAll({
			filters,
			page,
			pageSize: size,
		});
		res.json({
			success: true,
			data: movies,
			count: movies.length,
			page,
			pageSize: size,
		});
	} catch (error) {
		console.error("Error fetching movies:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching movies",
			error: error.message,
		});
	}
});

// Removed: extra search endpoints to limit to required 5 endpoints

// Removed: universal get to limit to required 5 endpoints

// Removed: universal search to limit to required 5 endpoints

// GET /api/movies/:id - Get movie by ID
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const movie = await movieService.getById(id);

		if (!movie) {
			return res.status(404).json({
				success: false,
				message: "Movie not found",
			});
		}

		res.json({
			success: true,
			data: movie,
		});
	} catch (error) {
		console.error("Error fetching movie:", error);
		res.status(500).json({
			success: false,
			message: "Error fetching movie",
			error: error.message,
		});
	}
});

// POST /api/movies - Create new movie
router.post("/", async (req, res) => {
	try {
		const movie = await movieService.create(req.body);
		res.status(201).json({
			success: true,
			data: movie,
			message: "Movie created successfully",
		});
	} catch (error) {
		console.error("Error creating movie:", error);
		res.status(400).json({
			success: false,
			message: "Error creating movie",
			error: error.message,
		});
	}
});

// PUT /api/movies/:id - Update movie
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const movie = await movieService.update(id, req.body);

		if (!movie) {
			return res.status(404).json({
				success: false,
				message: "Movie not found",
			});
		}

		res.json({
			success: true,
			data: movie,
			message: "Movie updated successfully",
		});
	} catch (error) {
		console.error("Error updating movie:", error);
		res.status(400).json({
			success: false,
			message: "Error updating movie",
			error: error.message,
		});
	}
});

// DELETE /api/movies/:id - Delete movie
router.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const movie = await movieService.remove(id);

		if (!movie) {
			return res.status(404).json({
				success: false,
				message: "Movie not found",
			});
		}

		res.json({
			success: true,
			data: movie,
			message: "Movie deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting movie:", error);
		res.status(400).json({
			success: false,
			message: "Error deleting movie",
			error: error.message,
		});
	}
});

module.exports = router;
