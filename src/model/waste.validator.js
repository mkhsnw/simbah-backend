const Joi = require("joi");

const validateWaste = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    pricePerKg: Joi.number().required(),
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
  validateWaste,
};
