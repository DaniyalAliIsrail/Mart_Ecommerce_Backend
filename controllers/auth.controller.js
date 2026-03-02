import { sequelize } from "../models/index.js";

import * as authServices from "../services/auth.service.js";

export const signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { fullName, email, password } = req.body;
    const user = await authServices.register(fullName, email, password, transaction)
    await transaction.commit();
    res.json({ status: 201, success: true, message: "Signup successful", user });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Failed to signup:", error);
    res.status(500).json({ success: false, message: "Failed to signup" });
  }
};

export const login = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    console.log("check login", email, password)
    const result = await authServices.login(email, password, transaction);
    console.log(result)
    // Store refresh token
    await authServices.storeRefreshToken(result.user.id, transaction);
    // Commit the transaction if everything succeeds
    await transaction.commit();

    res.json(result);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Failed to login:", error.message);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }

}