import { sequelize } from "../models/index.js";

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }finally{
        sequelize.close();
    }
};

export { connectDB };
