import React, { useState, useEffect, useCallback } from "react";
import {
	Search,
	X,
	Film,
	DollarSign,
	Calendar,
	Star,
	Users,
} from "lucide-react";
import { searchMovies, getAllMovies } from "./services/api";

function App() {
	const [searchQuery, setSearchQuery] = useState("");
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [hasSearched, setHasSearched] = useState(false);

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce(async (query) => {
			if (query.trim() === "") {
				setMovies([]);
				setHasSearched(false);
				return;
			}

			setLoading(true);
			setError(null);
			setHasSearched(true);

			try {
				const response = await searchMovies(query);
				setMovies(response.data || []);
			} catch (err) {
				setError("Failed to search movies. Please try again.");
				console.error("Search error:", err);
			} finally {
				setLoading(false);
			}
		}, 300),
		[]
	);

	// Handle search input change
	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		debouncedSearch(value);
	};

	// Clear search
	const clearSearch = () => {
		setSearchQuery("");
		setMovies([]);
		setError(null);
		setHasSearched(false);
	};

	// Load all movies on component mount
	useEffect(() => {
		const loadAllMovies = async () => {
			setLoading(true);
			try {
				const response = await getAllMovies();
				setMovies(response.data || []);
			} catch (err) {
				setError("Failed to load movies. Please try again.");
				console.error("Load error:", err);
			} finally {
				setLoading(false);
			}
		};

		loadAllMovies();
	}, []);

	return (
		<div className="container">
			<div className="search-container">
				<div className="search-header">
					<h1>🎬 Movie Search</h1>
					<p>Search through our collection of movies</p>
				</div>

				<div className="search-input-container">
					<Search className="search-icon" />
					<input
						type="text"
						className="search-input"
						placeholder="Search for movies by title or description..."
						value={searchQuery}
						onChange={handleSearchChange}
					/>
				</div>

				{error && <div className="error-state">{error}</div>}

				<div className="results-container">
					{hasSearched && (
						<div className="results-header">
							<div className="results-count">
								{loading
									? "Searching..."
									: `${movies.length} movie${
											movies.length !== 1 ? "s" : ""
									  } found`}
								{searchQuery && ` for "${searchQuery}"`}
							</div>
							{searchQuery && (
								<button
									className="clear-button"
									onClick={clearSearch}
								>
									<X
										size={16}
										style={{ marginRight: "0.5rem" }}
									/>
									Clear Search
								</button>
							)}
						</div>
					)}

					{loading && (
						<div className="loading">
							<div className="loading-spinner"></div>
							<p>Searching movies...</p>
						</div>
					)}

					{!loading &&
						!error &&
						movies.length === 0 &&
						hasSearched && (
							<div className="empty-state">
								<Film className="empty-state-icon" />
								<h3>No movies found</h3>
								<p>Try adjusting your search terms</p>
							</div>
						)}

					{!loading &&
						!error &&
						movies.length === 0 &&
						!hasSearched && (
							<div className="empty-state">
								<Search className="empty-state-icon" />
								<h3>Start searching</h3>
								<p>Enter a search term to find movies</p>
							</div>
						)}

					{!loading && movies.length > 0 && (
						<div className="items-grid">
							{movies.map((movie) => (
								<MovieCard key={movie.id} movie={movie} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Movie Card Component
function MovieCard({ movie }) {
	const formatCurrency = (amount) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatCast = (cast) => {
		if (!cast || !Array.isArray(cast)) return "N/A";
		return cast.length > 3
			? `${cast.slice(0, 3).join(", ")} and ${cast.length - 3} more`
			: cast.join(", ");
	};

	return (
		<div className="item-card">
			<div className="item-name">
				{movie.title}
				{movie.is_hit && (
					<Star
						size={16}
						style={{
							marginLeft: "0.5rem",
							color: "#ffd700",
							fill: "#ffd700",
						}}
					/>
				)}
			</div>
			<div className="item-description">{movie.description}</div>

			<div className="movie-details">
				<div className="movie-budget">
					<DollarSign size={16} style={{ marginRight: "0.5rem" }} />
					<span>Budget: {formatCurrency(movie.budget)}</span>
				</div>
				<div className="movie-collection">
					<DollarSign size={16} style={{ marginRight: "0.5rem" }} />
					<span>Collection: {formatCurrency(movie.collection)}</span>
				</div>
				{movie.profit && (
					<div className="movie-profit">
						<DollarSign
							size={16}
							style={{ marginRight: "0.5rem" }}
						/>
						<span>Profit: {formatCurrency(movie.profit)}</span>
					</div>
				)}
			</div>

			<div className="movie-meta">
				<div className="movie-cast">
					<Users size={14} style={{ marginRight: "0.5rem" }} />
					<span>{formatCast(movie.cast)}</span>
				</div>
				<div className="movie-date">
					<Calendar size={14} style={{ marginRight: "0.5rem" }} />
					<span>Released: {formatDate(movie.release_date)}</span>
				</div>
			</div>
		</div>
	);
}

// Debounce utility function
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

export default App;
