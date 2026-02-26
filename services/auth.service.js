import db from "../models/index.js";
const { User } = db;

import bcrypt from "bcryptjs";
import generateError from "../utils/generateError.js";


export const createUser = async (fullName, email, password, transaction) => {
       // 1. Check if user already exists
       const existingUser = await User.findOne({ where: { email } }, { transaction });
       if (existingUser) {
              throw generateError("Email already registered", 400)
       }

       // 2. Hash passwordt
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       // 3. Create user
       const user = await User.create({
              fullName,
              email,
              password: hashedPassword
       }, { transaction });

       return user;
};