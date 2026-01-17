require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST || "127.0.0.1",
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "password",
            database: process.env.DB_NAME || "demo_credit",
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "./src/database/migrations",
            extension: "ts", // Knex still needs to know migrations are TS
            loadExtensions: [".ts"] // Crucial for knex to load ts files
        },
        seeds: {
            directory: "./src/database/seeds",
            extension: "ts",
            loadExtensions: [".ts"]
        }
    },
    production: {
        client: "mysql2",
        connection: process.env.DATABASE_URL || {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "./src/database/migrations",
            extension: "ts"
        }
    }
};
