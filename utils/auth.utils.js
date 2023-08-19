import {
  closeDB,
  connectToDB,
  getClient,
} from "../config/mongodb.connection.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const usernameChecker = async (username) => {
  try {
    await connectToDB();
    const auth = await getClient().db(config.database).collection("auth-data");
    const res = await auth.findOne({ username });
    return res ? res : false;
  } catch (error) {
    console.error(error);
    return error;
  } finally {
    await closeDB();
  }
};

const passwordCompare = async (req_password, db_password) => {
  try {
    return await bcrypt.compare(req_password, db_password);
  } catch (err) {
    console.error(err);
  }
};
const generateAccessToken = async (user, expiresIn) => {
  return jwt.sign(user, process.env.JWT_SECRET_TOKEN, { expiresIn });
};

const generateRefreshToken = async (user, expiresIn) => {
  return jwt.sign(user, process.env.JWT_SECRET_TOKEN, { expiresIn });
};

const validateToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, data) => {
    return err ? false : data;
  });
};

export default {
  usernameChecker,
  passwordCompare,
  generateAccessToken,
  generateRefreshToken,
  validateToken,
};
