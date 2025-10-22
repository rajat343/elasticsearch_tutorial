const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");

class MovieDataInserter {
	constructor() {
		this.dataFile = path.join(__dirname, "..", "data", "movies_data.json");
	}

	async insertMoviesData() {
		try {
			console.log("🎬 Starting movie data insertion...");

			// Check if data file exists
			if (!fs.existsSync(this.dataFile)) {
				throw new Error(`Data file not found: ${this.dataFile}`);
			}

			// Read and parse JSON data
			const rawData = fs.readFileSync(this.dataFile, "utf8");
			const movies = JSON.parse(rawData);

			console.log(`📁 Found ${movies.length} movies to insert`);

			// Check if movies table exists and has data
			const existingCount = await prisma.movie.count();

			if (existingCount > 0) {
				console.log(
					`⚠️  Found ${existingCount} existing movies in database`
				);
				const answer = await this.askUser(
					"Do you want to clear existing data and insert fresh data? (y/N): "
				);

				if (
					answer.toLowerCase() === "y" ||
					answer.toLowerCase() === "yes"
				) {
					console.log("🗑️  Clearing existing movie data...");
					await prisma.movie.deleteMany();
					console.log("✅ Existing data cleared");
				} else {
					console.log(
						"📝 Inserting new movies only (skipping duplicates)..."
					);
					await this.insertMoviesWithDuplicateCheck(movies);
					return;
				}
			}

			// Insert movies in batches
			await this.insertMoviesInBatches(movies);

			console.log("✅ Movie data insertion completed successfully!");
		} catch (error) {
			console.error("❌ Error inserting movie data:", error);
			throw error;
		} finally {
			await prisma.$disconnect();
		}
	}

	async insertMoviesInBatches(movies) {
		const batchSize = 50; // Insert 50 movies at a time
		let insertedCount = 0;

		for (let i = 0; i < movies.length; i += batchSize) {
			const batch = movies.slice(i, i + batchSize);

			try {
				await this.insertBatch(batch);
				insertedCount += batch.length;
				console.log(
					`📊 Inserted ${insertedCount}/${movies.length} movies`
				);
			} catch (error) {
				console.error(
					`❌ Error inserting batch ${
						Math.floor(i / batchSize) + 1
					}:`,
					error
				);
				throw error;
			}
		}
	}

	async insertBatch(movies) {
		// Transform data for Prisma
		const movieData = movies.map((movie) => ({
			title: movie.title,
			description: movie.description,
			releaseDate: movie.release_date
				? new Date(movie.release_date)
				: null,
			budget: movie.budget ? BigInt(movie.budget) : null,
			collection: movie.collection ? BigInt(movie.collection) : null,
			cast: movie.cast || [],
			isHit: movie.is_hit || false,
		}));

		// Use Prisma's createMany for batch insertion
		await prisma.movie.createMany({
			data: movieData,
			skipDuplicates: true, // Skip duplicates based on unique constraints
		});
	}

	async insertMoviesWithDuplicateCheck(movies) {
		let insertedCount = 0;
		let skippedCount = 0;

		for (const movie of movies) {
			try {
				// Check if movie already exists (by title)
				const existing = await prisma.movie.findFirst({
					where: { title: movie.title },
				});

				if (existing) {
					skippedCount++;
					continue;
				}

				// Insert new movie
				await prisma.movie.create({
					data: {
						title: movie.title,
						description: movie.description,
						releaseDate: movie.release_date
							? new Date(movie.release_date)
							: null,
						budget: movie.budget ? BigInt(movie.budget) : null,
						collection: movie.collection
							? BigInt(movie.collection)
							: null,
						cast: movie.cast || [],
						isHit: movie.is_hit || false,
					},
				});

				insertedCount++;

				if (insertedCount % 10 === 0) {
					console.log(
						`📊 Processed ${insertedCount + skippedCount}/${
							movies.length
						} movies (${insertedCount} inserted, ${skippedCount} skipped)`
					);
				}
			} catch (error) {
				console.error(
					`❌ Error inserting movie "${movie.title}":`,
					error
				);
				// Continue with next movie
			}
		}

		console.log(
			`✅ Data insertion completed: ${insertedCount} inserted, ${skippedCount} skipped`
		);
	}

	async askUser(question) {
		const readline = require("readline");
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		return new Promise((resolve) => {
			rl.question(question, (answer) => {
				rl.close();
				resolve(answer);
			});
		});
	}

	async getStats() {
		try {
			const stats = await prisma.movie.aggregate({
				_count: {
					_all: true,
				},
				_avg: {
					budget: true,
					collection: true,
				},
				_min: {
					releaseDate: true,
				},
				_max: {
					releaseDate: true,
				},
			});

			const hitMovies = await prisma.movie.count({
				where: { isHit: true },
			});

			console.log("📊 Movie Database Statistics:");
			console.log({
				total_movies: stats._count._all,
				hit_movies: hitMovies,
				avg_budget: stats._avg.budget ? Number(stats._avg.budget) : 0,
				avg_collection: stats._avg.collection
					? Number(stats._avg.collection)
					: 0,
				earliest_release: stats._min.releaseDate,
				latest_release: stats._max.releaseDate,
			});

			return stats;
		} catch (error) {
			console.error("❌ Error getting stats:", error);
			throw error;
		} finally {
			await prisma.$disconnect();
		}
	}
}

// CLI interface
async function main() {
	const command = process.argv[2];
	const inserter = new MovieDataInserter();

	try {
		switch (command) {
			case "insert":
				await inserter.insertMoviesData();
				break;
			case "stats":
				await inserter.getStats();
				break;
			default:
				console.log("📖 Movie Data Inserter Usage:");
				console.log(
					"  node insert-movies-data.js insert  - Insert movies data from JSON"
				);
				console.log(
					"  node insert-movies-data.js stats   - Show database statistics"
				);
				break;
		}
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

module.exports = MovieDataInserter;
