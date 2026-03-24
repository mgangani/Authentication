import RolePermission from "./models/RolePermission.js";
import ROLES from "./config/roles.js";
import PERMISSIONS from "./config/permissions.js";

export const seedRolePermissions = async () => {
  await RolePermission.deleteMany(); // reset (optional)

  await RolePermission.insertMany([
    {
      role: ROLES.ADMIN,
      permissions: ["*"],
    },
    {
      role: ROLES.MANAGER,
      permissions: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.PROFILE_VIEW,
        PERMISSIONS.PROFILE_EDIT,
      ],
    },
    {
      role: ROLES.EMPLOYEE,
      permissions: [
        PERMISSIONS.PROFILE_VIEW,
        PERMISSIONS.PROFILE_EDIT,
      ],
    },
  ]);

  console.log("Role permissions seeded");
};
