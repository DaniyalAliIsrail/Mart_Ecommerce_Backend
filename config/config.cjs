/**
 * CJS config wrapper for sequelize-cli compatibility.
 * sequelize-cli does NOT support ESM, so this file re-exports
 * the same config shape in CommonJS format.
 *
 * Usage: referenced by .sequelizerc
 */
require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "martecommerce_db",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE_TEST || "martecommerce_db_test",
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_CONNECTION || "mysql",
        logging: false,
        use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : undefined,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    },
};
