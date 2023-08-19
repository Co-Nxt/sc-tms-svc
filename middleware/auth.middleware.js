import authUtils from "../utils/auth.utils.js";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("token", token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const validate = await authUtils.validateToken(token);
  console.log(("validate", validate));
  return validate ? (next()) : res.status(403).send({meesage:"Forbidden"});
};

export { authenticateToken };
