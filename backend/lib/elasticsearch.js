const { Client } = require("@elastic/elasticsearch");

// Elasticsearch configuration
const ES_NODE = process.env.ES_NODE || "http://localhost:9200";

// Create Elasticsearch client
const client = new Client({
	node: ES_NODE,
	requestTimeout: 30000,
	maxRetries: 3,
});

module.exports = client;
