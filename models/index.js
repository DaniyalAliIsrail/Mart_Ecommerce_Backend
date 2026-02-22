import { Sequelize } from "sequelize";
import { readdirSync } from "fs";
import { basename as _basename, join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { activeConfig } from "../config/config.js";

// ESM equivalents of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = _basename(__filename);

// ========================
// Initialize Sequelize
// ========================
let sequelize;

if (process.env.DATABASE_URL) {
    // Production: use DATABASE_URL connection string (Railway, Render, etc.)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: activeConfig.dialect,
        logging: activeConfig.logging,
        dialectOptions: activeConfig.dialectOptions || {},
        ...(activeConfig.pool && { pool: activeConfig.pool }),
    });
} else {
    // Local development: use individual connection params
    sequelize = new Sequelize(
        activeConfig.database,
        activeConfig.username,
        activeConfig.password,
        {
            host: activeConfig.host,
            port: activeConfig.port,
            dialect: activeConfig.dialect,
            logging: activeConfig.logging,
            ...(activeConfig.dialectOptions && {
                dialectOptions: activeConfig.dialectOptions,
            }),
            ...(activeConfig.pool && { pool: activeConfig.pool }),
        }
    );
}

const db = {};

// ========================
// Dynamically load all model files from this directory
// ========================
const modelFiles = readdirSync(__dirname).filter((file) => {
    return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        file.endsWith(".js") &&
        !file.endsWith(".test.js")
    );
});

for (const file of modelFiles) {
    const filePath = join(__dirname, file);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: modelDef } = await import(fileUrl);

    if (typeof modelDef === "function") {
        const model = modelDef(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    }
}

// ========================
// Run model associations
// ========================
Object.keys(db).forEach((modelName) => {
    if (typeof db[modelName].associate === "function") {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize };