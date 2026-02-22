import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";

// Initialize express app
const app = express();

// Define port & environment
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

// ========================
// Middleware
// ========================
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ limit: "40mb", extended: true }));
app.use(cookieParser());
app.use(helmet());

// ========================
// Routes
// ========================
app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running..." });
});

// ========================
// Start Server
// ========================
const startServer = async () => {
    try {
        // Connect to database & sync models
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT} in ${ENV} mode`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();