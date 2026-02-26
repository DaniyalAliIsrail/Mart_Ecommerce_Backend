import { sequelize } from "../models/index.js";

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1); // Exit if DB connection fails — no point running without a DB
    }
};

export { connectDB };
