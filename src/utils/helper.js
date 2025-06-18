const generateAccountNumber = () => {
  const randomNumber = Math.random().toString().slice(2, 12);
  console.log("Generated Account Number:", randomNumber);
  return randomNumber;
};

module.exports = {
  generateAccountNumber,
};
