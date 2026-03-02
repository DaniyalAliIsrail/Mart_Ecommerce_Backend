import { sequelize } from "../models/index.js";

import * as authServices from "../services/auth.service.js";

export const createCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {

  } catch (error) {
    console.log(error);
  }
};