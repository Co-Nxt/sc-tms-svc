import config from "../config/config.js";
import {
  getClient,
  closeDB,
  connectToDB,
} from "../config/mongodb.connection.js";
import utils from "../utils/helper.js";
import authUtils from "../utils/auth.utils.js";

const userLogin = async (data, callback) => {
  console.log("userLogin",data);
  const userDetails = await authUtils.usernameChecker(data.username);
  const passwordChecker = await authUtils.passwordCompare(
    data.password,
    userDetails.password
  );
  console.log("username", userDetails);
  console.log("passwordChecker", passwordChecker);
  if (passwordChecker) {
    const generatedToken = await authUtils.generateAccessToken(
      userDetails,
      "60m"
    );
    const generatedRefreshToken = await authUtils.generateRefreshToken(
      userDetails,
      "61m"
    );
    const user = {
      accessToken: generatedToken,
      expires_in: "15m",
      refreshToken: generatedRefreshToken,
      refresh_expires_in: "20m",
    };
    console.log("user", user);

    callback(true, user);
  } else {
    callback(false, "userInnvalid");
  }
};

const userRegistration = async (data, callback) => {
  try {
    const hashPass = await utils.hashPassword(data.password);
    const user = {
      _id: utils.uuid,
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashPass,
      created_at: utils.dateNow,
      updated_at: utils.dateNow,
    };
    console.log("user", user);

    await connectToDB();
    const auth = await getClient().db(config.database).collection("auth-data");
    const res = await auth.insertOne(user);
    console.log("res", res);
    callback(true, res);
  } catch (error) {
    console.error("error", error);
  } finally {
    await closeDB();
  }
};

const userValidation = async (data, callback) => {
  console.log("data", data);

  if (!data.accessToken) {
    callback(false, "No Token");
  } else {
    const validateToken = await authUtils.validateToken(data.accessToken);
    console.log("validateToken", validateToken);
    validateToken
      ? callback(true, validateToken)
      : callback(false, validateToken);
  }
};
const getUserData = async (token,callback)=>{
    if (!token) {
      callback(false, "No Token");
    } else {
      const validateToken = await authUtils.validateToken(token);
      const { password, ...userWithoutPass } = validateToken;
      userWithoutPass
        ? callback(true, userWithoutPass)
        : callback(false, userWithoutPass);
    }
}
export { userRegistration, userLogin, userValidation, getUserData };
