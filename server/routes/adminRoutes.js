import express from "express";
import {
  approveHospitalAdmin,
  createInitialSuperAdmin,
  getAllHospitalAdmins,
  getAllUsers,
  getPendingHospitalAdmins,
  rejectHospitalAdmin,
} from "../controllers/adminController.js";
import {
  authorizeRoles,
  verifyToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/bootstrap-super-admin", createInitialSuperAdmin);

router.get(
  "/hospital-admins",
  verifyToken,
  authorizeRoles("superAdmin"),
  getAllHospitalAdmins
);

router.get(
  "/users",
  verifyToken,
  authorizeRoles("superAdmin"),
  getAllUsers
);

router.get(
  "/pending-hospital-admins",
  verifyToken,
  authorizeRoles("superAdmin"),
  getPendingHospitalAdmins
);

router.patch(
  "/approve-hospital-admin/:id",
  verifyToken,
  authorizeRoles("superAdmin"),
  approveHospitalAdmin
);

router.patch(
  "/reject-hospital-admin/:id",
  verifyToken,
  authorizeRoles("superAdmin"),
  rejectHospitalAdmin
);

export default router;
