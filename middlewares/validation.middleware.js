export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse(req.body);

    req.body = result;

    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
};
