const movieRepository = require("./movie.repository");

class MovieService {
	async getAll({ filters = {}, page = 1, pageSize = 25 } = {}) {
		return await movieRepository.getAll({ ...filters, page, pageSize });
	}

	async getById(id) {
		return await movieRepository.getById(id);
	}

	async create(data) {
		return await movieRepository.create(data);
	}

	async update(id, data) {
		return await movieRepository.update(id, data);
	}

	async remove(id) {
		return await movieRepository.remove(id);
	}
}

module.exports = new MovieService();
