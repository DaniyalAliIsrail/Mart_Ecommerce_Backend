import express from "express";
import { createCategory } from "../controllers/admin.controller.js";
import { authenticateToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/create-category",  createCategory);
// router.post("/update-category", updateCategory);
// router.post("/delete-category", deleteCategory);
// router.post("/get-all-category", getAllCategory);

export default router;