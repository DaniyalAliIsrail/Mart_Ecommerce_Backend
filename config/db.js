import { sequelize } from "../models/index.js";

const ENV = process.env.NODE_ENV || "development";

/**
 * Authenticate database connection and sync models.
 * Call this before starting the Express server.
 *
 * - In development/test: syncs models with { alter: true } for convenience.
 * - In production: only authenticates (schema changes should use migrations).
 */
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");

        if (ENV === "production") {
            // In production, use migrations instead of sync
            console.log(
                "ℹ️  Production mode — skipping auto-sync (use migrations)"
            );
        } else {
            // In development/test, sync models for convenience
            await sequelize.sync({ alter: true });
            console.log("✅ Models synchronized (dev mode)");
        }
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        if (ENV !== "production") {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

export { connectDB };
