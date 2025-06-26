const joi = require('joi');

const validateUser = (req,res,next) => {
  const schema = joi.object({
    name: joi.string().min(2).required(),
    email: joi.string().email().required(),
    role: joi.string().valid('USER', 'ADMIN').default('USER'),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateUser,
};
