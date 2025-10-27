const es = require("./elasticsearch");

const INDEX = process.env.ES_MOVIES_INDEX || "movies";

/**
 * Ensure the Elasticsearch index exists with proper mappings
 */
async function ensureIndex() {
	const exists = await es.indices.exists({ index: INDEX });
	if (!exists) {
		await es.indices.create({
			index: INDEX,
			settings: {
				analysis: {
					analyzer: {
						english_custom: {
							type: "standard",
							stopwords: "_english_",
						},
					},
				},
			},
			mappings: {
				properties: {
					title: { type: "text", analyzer: "english_custom" },
					description: { type: "text", analyzer: "english_custom" },
					cast: { type: "text", analyzer: "english_custom" },
					isHit: { type: "boolean" },
					releaseDate: { type: "date" },
					budget: { type: "long" },
					collection: { type: "long" },
					createdAt: { type: "date" },
					updatedAt: { type: "date" },
				},
			},
		});
		console.log(`✅ Created Elasticsearch index: ${INDEX}`);
	}
}

/**
 * Index a single movie document
 */
async function indexMovie(movie) {
	// movie.id should be numeric; ES doc _id as string
	await es.index({
		index: INDEX,
		id: String(movie.id),
		document: {
			id: movie.id,
			title: movie.title,
			description: movie.description,
			releaseDate: movie.releaseDate || null,
			budget: movie.budget != null ? Number(movie.budget) : null,
			collection:
				movie.collection != null ? Number(movie.collection) : null,
			cast: Array.isArray(movie.cast) ? movie.cast : [],
			isHit: !!movie.isHit,
			createdAt: movie.createdAt || null,
			updatedAt: movie.updatedAt || null,
		},
		refresh: "wait_for",
	});
}

/**
 * Delete a movie document from Elasticsearch
 */
async function deleteMovie(id) {
	await es.delete({
		index: INDEX,
		id: String(id),
		ignore: [404],
		refresh: "wait_for",
	});
}

/**
 * Search movies using full-text search
 */
async function searchMovies({ q, page = 1, pageSize = 25 }) {
	const from = (Math.max(1, page) - 1) * Math.max(1, pageSize);
	const size = Math.max(1, pageSize);

	const body = await es.search({
		index: INDEX,
		from,
		size,
		query: q
			? {
					multi_match: {
						query: q,
						fields: ["title^3", "description^1.5", "cast^2"],
					},
			  }
			: { match_all: {} },
	});

	const hits = body.hits?.hits || [];
	return {
		results: hits.map((h) => ({
			id: Number(h._id),
			score: h._score,
			...h._source,
		})),
		total: body.hits?.total?.value || 0,
	};
}

module.exports = { ensureIndex, indexMovie, deleteMovie, searchMovies, INDEX };
