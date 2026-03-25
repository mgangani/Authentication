import RolePermission from "../models/RolePermission.js";

export const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const roleData = await RolePermission.findOne({ role: user.role });

      if (!roleData) {
        return res.status(403).json({ message: "Role permissions not found" });
      }

      const permissions = roleData.permissions;

      const hasAccess =
        permissions.includes("*") ||
        requiredPermissions.every((p) => permissions.includes(p));

      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (err) {
      return res.status(500).json({
        message: "Authorization failed",
        error: err.message,
      });
    }
  };
};

export const authorizeOwnerOr = (permission) => {
  return async (req, res, next) => {
    try {
      const { role } = req.user;
      const userId = req.user.id;

      if (role === "admin") return next();

      if (req.params.id === userId) return next();

      const roleData = await RolePermission.findOne({ role });
      const permissions = roleData?.permissions || [];

      if (permissions.includes(permission)) return next();

      return res.status(403).json({ message: "Forbidden" });
    } catch (err) {
      return res.status(500).json({
        message: "Authorization failed",
        error: err.message,
      });
    }
  };
};
