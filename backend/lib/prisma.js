const { PrismaClient } = require("@prisma/client");

// Provide a default DATABASE_URL so no .env is required
process.env.DATABASE_URL =
	"postgresql://localhost:password@localhost:5432/elasticsearch_tutorial";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

module.exports = prisma;
