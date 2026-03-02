import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;


export const extractBearerToken = (authHeader) => {
    if (!authHeader || typeof authHeader !== "string") {
        return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    console.log(parts[1]);
    return parts[1];
};

export const authenticateToken = async (req, res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                message: "Access token is required",
                error: "MISSING_TOKEN",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid token structure",
                error: "INVALID_TOKEN_PAYLOAD",
            });
        }

        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                error: "USER_NOT_FOUND",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired",
                error: "TOKEN_EXPIRED",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token",
                error: "INVALID_TOKEN",
            });
        }

        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Authentication failed" });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required",
            error: "USER_NOT_AUTHENTICATED",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required",
            error: "INSUFFICIENT_PERMISSIONS",
        });
    }

    next();
};
