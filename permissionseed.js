import RolePermission from "./models/RolePermission.js";
import ROLES from "./config/roles.js";
import PERMISSIONS from "./config/permissions.js";

export const seedRolePermissions = async () => {
  const rolePermissions = [
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
  ];

  const existingCount = await RolePermission.countDocuments();

  if (existingCount > 0) {
    console.log("Role permissions already exist, skipping seed");
    return;
  }

  await RolePermission.insertMany(rolePermissions);

  console.log("Role permissions seeded");
};
