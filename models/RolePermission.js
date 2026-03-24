import mongoose from "mongoose";
import ROLES from "../config/roles.js";
import PERMISSIONS from "../config/permissions.js";

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    unique: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
});

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);

export default RolePermission;