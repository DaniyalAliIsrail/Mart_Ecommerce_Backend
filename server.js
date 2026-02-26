import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import indexRoutes from "./routes/index.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

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
app.use("/api/v1", indexRoutes); // Mount API routes under /api/v1
app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running..." });
});

app.use(errorMiddleware);


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