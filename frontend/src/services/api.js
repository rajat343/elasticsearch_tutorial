import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
	baseURL: "/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		console.log(
			`Making ${config.method?.toUpperCase()} request to ${config.url}`
		);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		console.error("API Error:", error);

		if (error.response) {
			// Server responded with error status
			const message = error.response.data?.message || "An error occurred";
			throw new Error(message);
		} else if (error.request) {
			// Request was made but no response received
			throw new Error("Network error. Please check your connection.");
		} else {
			// Something else happened
			throw new Error("An unexpected error occurred");
		}
	}
);

// API functions
export const searchMovies = async (query) => {
	try {
		const response = await api.get(
			`/movies/search?q=${encodeURIComponent(query)}`
		);
		return response;
	} catch (error) {
		throw error;
	}
};

export const getAllMovies = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams();
		Object.keys(filters).forEach((key) => {
			if (filters[key] !== undefined && filters[key] !== null) {
				queryParams.append(key, filters[key]);
			}
		});
		const queryString = queryParams.toString();
		const url = queryString ? `/movies?${queryString}` : "/movies";
		const response = await api.get(url);
		return response;
	} catch (error) {
		throw error;
	}
};

export const getMovieById = async (id) => {
	try {
		const response = await api.get(`/movies/${id}`);
		return response;
	} catch (error) {
		throw error;
	}
};

export const getHitMovies = async () => {
	try {
		const response = await api.get("/movies/hit");
		return response;
	} catch (error) {
		throw error;
	}
};

export const getMoviesByCast = async (castMember) => {
	try {
		const response = await api.get(
			`/movies/cast/${encodeURIComponent(castMember)}`
		);
		return response;
	} catch (error) {
		throw error;
	}
};

export const getMoviesByYearRange = async (startYear, endYear) => {
	try {
		const response = await api.get(`/movies/year/${startYear}/${endYear}`);
		return response;
	} catch (error) {
		throw error;
	}
};

export const createMovie = async (movieData) => {
	try {
		const response = await api.post("/movies", movieData);
		return response;
	} catch (error) {
		throw error;
	}
};

export const updateMovie = async (id, movieData) => {
	try {
		const response = await api.put(`/movies/${id}`, movieData);
		return response;
	} catch (error) {
		throw error;
	}
};

export const deleteMovie = async (id) => {
	try {
		const response = await api.delete(`/movies/${id}`);
		return response;
	} catch (error) {
		throw error;
	}
};

// Health check
export const checkHealth = async () => {
	try {
		const response = await api.get("/health");
		return response;
	} catch (error) {
		throw error;
	}
};

export default api;
