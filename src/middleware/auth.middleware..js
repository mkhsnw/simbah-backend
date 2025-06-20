const { verivyToken } = require("../utils/token");

const validateAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token Unauthorized",
    });
  }

  const validToken = await verivyToken(token);
  console.log(validToken);

  req.user = validToken;

  console.log(req.user);
  next();
};
module.exports = { validateAuth };
