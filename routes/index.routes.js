import express from "express";
import authRoutes from "./auth.routes.js";
import { authenticateToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRoutes);
// admin
router.use("/admin",authenticateToken, isAdmin, adminRoutes);

export default router;

