import { sequelize } from "../models/index.js";

import * as authServices from "../services/auth.service.js";

export const signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { fullName, email, password } = req.body;
    const user = await authServices.createUser(fullName, email, password, transaction)
    await transaction.commit();
    res.json({ status: 201, success: true, message: "Signup successful", user });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Failed to signup:", error);
    res.status(500).json({ success: false, message: "Failed to signup" });
  }
};