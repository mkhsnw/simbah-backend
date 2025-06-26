const joi = require("joi");

const validateTransaction = (req, res, next) => {
  let schema;
  const type = req.body.type;

  if (type === "DEPOSIT") {
    schema = joi.object({
      type: joi.string().valid("DEPOSIT").required(),
      userId: joi.string().required(),
      description: joi.string().max(255).optional().allow(""),
      items: joi
        .array()
        .items(
          joi.object({
            wasteCategoryId: joi.number().integer().positive().required(),
            weightInKg: joi.number().positive().required(),
          })
        )
        .min(1)
        .required(),
    });
  } else if (type === "WITHDRAWAL") {
    schema = joi.object({
      type: joi.string().valid("WITHDRAWAL").required(),
      userId: joi.string().required(),
      description: joi.string().max(255).optional().allow(""),
      amount: joi.number().positive().min(50000).required(),
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Request body must have a 'type' of 'DEPOSIT' or 'WITHDRAWAL'.",
    });
  }

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
  validateTransaction,
};
