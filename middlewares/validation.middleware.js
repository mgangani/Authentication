export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse(req.body);

    // attach validated data (clean & safe)
    req.body = result;

    next();
  } catch (err) {
    return res.status(400).json({
      errors: err.issues,
      message: "Validation error",
      success: false,
    });
  }
};
