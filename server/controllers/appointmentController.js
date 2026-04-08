import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

export const getApprovedHospitalAdmins = async (req, res) => {
  try {
    const hospitalAdmins = await User.find({
      role: "hospitalAdmin",
      isApproved: true,
    }).select("name email role isApproved");

    return res.status(200).json({
      message: "Approved hospital admins fetched successfully.",
      hospitalAdmins,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch hospital admins.",
      error: error.message,
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { hospitalAdminId, date } = req.body;

    if (!hospitalAdminId || !date) {
      return res.status(400).json({
        message: "hospitalAdminId and date are required.",
      });
    }

    const hospitalAdmin = await User.findById(hospitalAdminId);

    if (!hospitalAdmin || hospitalAdmin.role !== "hospitalAdmin") {
      return res.status(404).json({
        message: "Hospital admin not found.",
      });
    }

    if (!hospitalAdmin.isApproved) {
      return res.status(400).json({
        message: "Selected hospital admin is not approved yet.",
      });
    }

    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date.",
      });
    }

    if (appointmentDate < new Date()) {
      return res.status(400).json({
        message: "Appointment date must be today or later.",
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      hospitalAdminId,
      date: appointmentDate,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("userId", "name email role")
      .populate("hospitalAdminId", "name email role isApproved");

    return res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to book appointment.",
      error: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("hospitalAdminId", "name email role isApproved")
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Appointments fetched successfully.",
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch appointments.",
      error: error.message,
    });
  }
};

export const getAppointmentRequests = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      hospitalAdminId: req.user._id,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Appointment requests fetched successfully.",
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch appointment requests.",
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      hospitalAdminId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment request not found.",
      });
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("userId", "name email role")
      .populate("hospitalAdminId", "name email role isApproved");

    return res.status(200).json({
      message: `Appointment ${status} successfully.`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update appointment status.",
      error: error.message,
    });
  }
};
