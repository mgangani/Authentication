import { verifyAccessToken } from "../utils/generateJWT.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const accessToken = authHeader.slice(7);
    const decoded = verifyAccessToken(accessToken);

    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
