const prisma = require("../lib/prisma");

function serializeBigIntDeep(value) {
	if (typeof value === "bigint") return value.toString();
	if (Array.isArray(value)) return value.map(serializeBigIntDeep);
	if (value && typeof value === "object") {
		const serialized = {};
		for (const key of Object.keys(value)) {
			serialized[key] = serializeBigIntDeep(value[key]);
		}
		return serialized;
	}
	return value;
}

class MovieRepository {
	async getAll({
		is_hit,
		year,
		min_budget,
		max_budget,
		page = 1,
		pageSize = 25,
	} = {}) {
		const whereClause = {};

		if (is_hit !== undefined) {
			whereClause.isHit = is_hit === "true" || is_hit === true;
		}

		if (year) {
			const y = parseInt(year);
			whereClause.releaseDate = {
				gte: new Date(`${y}-01-01`),
				lt: new Date(`${y + 1}-01-01`),
			};
		}

		if (min_budget) {
			whereClause.budget = {
				...(whereClause.budget || {}),
				gte: BigInt(parseInt(min_budget)),
			};
		}

		if (max_budget) {
			whereClause.budget = {
				...(whereClause.budget || {}),
				lte: BigInt(parseInt(max_budget)),
			};
		}

		const safePage = Number(page) > 0 ? Number(page) : 1;
		const safeSize = Number(pageSize) > 0 ? Number(pageSize) : 25;
		const skip = (safePage - 1) * safeSize;

		const rows = await prisma.movie.findMany({
			where: whereClause,
			orderBy: { createdAt: "desc" },
			skip,
			take: safeSize,
		});

		return serializeBigIntDeep(rows);
	}

	async getById(id) {
		if (!id || isNaN(id)) return null;
		const row = await prisma.movie.findUnique({
			where: { id: parseInt(id) },
		});
		return row ? serializeBigIntDeep(row) : null;
	}

	async create(movieData) {
		const {
			title,
			description,
			release_date,
			budget,
			collection,
			cast,
			is_hit,
		} = movieData;

		const row = await prisma.movie.create({
			data: {
				title,
				description,
				releaseDate: release_date ? new Date(release_date) : null,
				budget: budget ? BigInt(budget) : null,
				collection: collection ? BigInt(collection) : null,
				cast: cast || [],
				isHit: is_hit || false,
			},
		});

		// Index in Elasticsearch
		const { indexMovie } = require("../lib/esMovies");
		await indexMovie(row).catch((err) =>
			console.error("Error indexing movie to ES:", err)
		);

		return serializeBigIntDeep(row);
	}

	async update(id, movieData) {
		if (!id || isNaN(id)) return null;
		const {
			title,
			description,
			release_date,
			budget,
			collection,
			cast,
			is_hit,
		} = movieData;

		const row = await prisma.movie.update({
			where: { id: parseInt(id) },
			data: {
				title,
				description,
				releaseDate: release_date ? new Date(release_date) : undefined,
				budget: budget ? BigInt(budget) : undefined,
				collection: collection ? BigInt(collection) : undefined,
				cast: cast || undefined,
				isHit: is_hit,
			},
		});

		// Re-index in Elasticsearch
		const { indexMovie } = require("../lib/esMovies");
		await indexMovie(row).catch((err) =>
			console.error("Error re-indexing movie to ES:", err)
		);

		return serializeBigIntDeep(row);
	}

	async remove(id) {
		if (!id || isNaN(id)) return null;
		const row = await prisma.movie.delete({ where: { id: parseInt(id) } });

		// Delete from Elasticsearch
		const { deleteMovie } = require("../lib/esMovies");
		await deleteMovie(id).catch((err) =>
			console.error("Error deleting movie from ES:", err)
		);

		return serializeBigIntDeep(row);
	}
}

module.exports = new MovieRepository();
