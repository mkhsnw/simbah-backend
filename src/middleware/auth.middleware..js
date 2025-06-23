const { verivyToken } = require("../utils/token");

const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  return token;
}

const validateAuth = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token Unauthorized",
    });
  }

  const validToken = await verivyToken(token);
  if (!validToken) {
    return res.status(401).json({
      success: false,
      message: "Token Unauthorized",
    });
  }
  req.user = validToken;
  next();
};
module.exports = { validateAuth, getToken };
