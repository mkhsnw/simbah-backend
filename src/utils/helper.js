const generateAccountNumber = () => {
  const randomNumber = Math.random().toString().slice(2, 12);
  console.log("Generated Account Number:", randomNumber);
  return randomNumber;
};

const getHeaderToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return token;
};

module.exports = {
  generateAccountNumber,
  getHeaderToken,
};
