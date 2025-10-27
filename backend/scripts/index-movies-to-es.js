const prisma = require("../lib/prisma");
const { ensureIndex, indexMovie } = require("../lib/esMovies");

/**
 * Backfill script to index all existing movies from Postgres into Elasticsearch
 */
async function main() {
	console.log("🔍 Starting Elasticsearch backfill...");

	// Ensure index exists
	await ensureIndex();
	console.log("✅ Elasticsearch index is ready");

	const batchSize = 500;
	let skip = 0;
	let totalIndexed = 0;

	while (true) {
		const rows = await prisma.movie.findMany({
			orderBy: { id: "asc" },
			skip,
			take: batchSize,
		});

		if (rows.length === 0) break;

		for (const row of rows) {
			try {
				await indexMovie(row);
				totalIndexed++;
			} catch (error) {
				console.error(
					`❌ Error indexing movie ${row.id}:`,
					error.message
				);
			}
		}
		skip += rows.length;
	}

	console.log(`🎉 Done! Total movies indexed: ${totalIndexed}`);
	await prisma.$disconnect();
	process.exit(0);
}

main().catch((error) => {
	console.error("❌ Backfill failed:", error);
	process.exit(1);
});
