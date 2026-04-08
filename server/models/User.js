import mongoose from "mongoose";

const allowedRoles = ["user", "hospitalAdmin", "superAdmin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: allowedRoles,
      default: "user",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function setApprovalForHospitalAdmins() {
  if (this.isNew && this.role === "hospitalAdmin") {
    this.isApproved = false;
  } else if (this.isApproved === undefined) {
    this.isApproved = true;
  }
});

const User = mongoose.model("User", userSchema);

export default User;
