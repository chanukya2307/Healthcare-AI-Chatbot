import express from "express";
import {
  authorizeRoles,
  verifyToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Authenticated user profile fetched successfully.",
    user: req.user,
  });
});

router.get(
  "/hospital-admin",
  verifyToken,
  authorizeRoles("hospitalAdmin", "superAdmin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome to the hospital admin protected route.",
      user: req.user,
    });
  }
);

router.get(
  "/super-admin",
  verifyToken,
  authorizeRoles("superAdmin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome to the super admin protected route.",
      user: req.user,
    });
  }
);

router.get(
  "/user",
  verifyToken,
  authorizeRoles("user", "hospitalAdmin", "superAdmin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome to the user protected route.",
      user: req.user,
    });
  }
);

export default router;
