import express from "express";
import {
  bookAppointment,
  getApprovedHospitalAdmins,
  getAppointmentRequests,
  getMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import {
  authorizeRoles,
  verifyToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/hospital-admins",
  verifyToken,
  authorizeRoles("user", "hospitalAdmin", "superAdmin"),
  getApprovedHospitalAdmins
);

router.post(
  "/book",
  verifyToken,
  authorizeRoles("user"),
  bookAppointment
);

router.get(
  "/my-appointments",
  verifyToken,
  authorizeRoles("user"),
  getMyAppointments
);

router.get(
  "/requests",
  verifyToken,
  authorizeRoles("hospitalAdmin"),
  getAppointmentRequests
);

router.patch(
  "/requests/:id/status",
  verifyToken,
  authorizeRoles("hospitalAdmin"),
  updateAppointmentStatus
);

export default router;
