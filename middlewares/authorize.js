import RolePermission from "../models/RolePermission.js";

export const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roleData = await RolePermission.findOne({ role: user.role });

    if (!roleData) {
      return res.status(403).json({ message: "No role permissions found" });
    }

    const permissions = roleData.permissions;

    const hasAccess =
      permissions.includes("*") ||
      requiredPermissions.every((p) => permissions.includes(p));

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export const authorizeOwnerOr = (permission) => {
  return async (req, res, next) => {
    const { role } = req.user;
    const userId = req.user.id;
    console.log("authorizeOwnerOr middleware", userId, role, req.params.id);

    if (role === "admin") return next();

    if (req.params.id === userId) return next();

    const roleData = await RolePermission.findOne({ role });

    const permissions = roleData?.permissions || [];

    if (permissions.includes(permission)) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
};
