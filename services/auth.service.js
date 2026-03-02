import db from "../models/index.js";
const { User, RefreshToken } = db;

import bcrypt from "bcryptjs";
import generateError from "../utils/generateError.js";
import jwt from "jsonwebtoken";


export const register = async (fullName, email, password, transaction) => {
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

const generateToken = (userId) => {
       return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7h" });
};

export const storeRefreshToken = async (userId, transaction) => {
       const existingToken = await RefreshToken.findOne({ where: { userId, isRevoked: false } }, { transaction });
       console.log("existingToken==>>>>>", existingToken)
       if (existingToken) {
              await existingToken.destroy({ transaction });
       }
       const refreshToken = generateToken(userId)
       await RefreshToken.create(
              {
                     userId,
                     token: refreshToken,
                     isRevoked: false,
                     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
              { transaction }
       );
};

export const login = async (email, password, transaction) => {
       const user = await User.findOne({
              where: { email },
              transaction
       })
       if (!user) {
              throw generateError("Invalid email or password", 401);
       }
       const isPasswordValid = await bcrypt.compare(password, user.password);
       if (!isPasswordValid) {
              throw generateError("Invalid email or password", 401);
       }
       const token = generateToken(user.id);
       return {
              token,
              user: {
                     id: user.id,
                     fullName: user.fullName,
                     email: user.email,
              }
       }

}