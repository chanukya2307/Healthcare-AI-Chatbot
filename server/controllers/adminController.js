import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createInitialSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    if (!name || !email || !password || !secret) {
      return res.status(400).json({
        message: "Name, email, password, and secret are required.",
      });
    }

    if (!process.env.SUPER_ADMIN_SECRET) {
      return res.status(500).json({
        message: "SUPER_ADMIN_SECRET is not configured on the server.",
      });
    }

    if (secret !== process.env.SUPER_ADMIN_SECRET) {
      return res.status(403).json({
        message: "Invalid super admin secret.",
      });
    }

    const existingSuperAdmin = await User.findOne({ role: "superAdmin" });

    if (existingSuperAdmin) {
      return res.status(409).json({
        message: "A super admin already exists. Use that account to manage admins.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superAdmin",
      isApproved: true,
    });

    return res.status(201).json({
      message: "Initial super admin created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create super admin.",
      error: error.message,
    });
  }
};

export const getPendingHospitalAdmins = async (req, res) => {
  try {
    const pendingAdmins = await User.find({
      role: "hospitalAdmin",
      isApproved: false,
    }).select("-password");

    return res.status(200).json({
      message: "Pending hospital admin registrations fetched successfully.",
      hospitalAdmins: pendingAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending hospital admins.",
      error: error.message,
    });
  }
};

export const getAllHospitalAdmins = async (req, res) => {
  try {
    const hospitalAdmins = await User.find({
      role: "hospitalAdmin",
    }).select("-password");

    return res.status(200).json({
      message: "Hospital admins fetched successfully.",
      hospitalAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch hospital admins.",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    }).select("-password");

    return res.status(200).json({
      message: "Users fetched successfully.",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

export const approveHospitalAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const hospitalAdmin = await User.findOne({
      _id: id,
      role: "hospitalAdmin",
    });

    if (!hospitalAdmin) {
      return res.status(404).json({
        message: "Hospital admin not found.",
      });
    }

    hospitalAdmin.isApproved = true;
    await hospitalAdmin.save();

    return res.status(200).json({
      message: "Hospital admin approved successfully.",
      user: {
        id: hospitalAdmin._id,
        name: hospitalAdmin.name,
        email: hospitalAdmin.email,
        role: hospitalAdmin.role,
        isApproved: hospitalAdmin.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to approve hospital admin.",
      error: error.message,
    });
  }
};

export const rejectHospitalAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const hospitalAdmin = await User.findOne({
      _id: id,
      role: "hospitalAdmin",
    });

    if (!hospitalAdmin) {
      return res.status(404).json({
        message: "Hospital admin not found.",
      });
    }

    hospitalAdmin.isApproved = false;
    await hospitalAdmin.save();

    return res.status(200).json({
      message: "Hospital admin rejected successfully.",
      user: {
        id: hospitalAdmin._id,
        name: hospitalAdmin.name,
        email: hospitalAdmin.email,
        role: hospitalAdmin.role,
        isApproved: hospitalAdmin.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reject hospital admin.",
      error: error.message,
    });
  }
};
