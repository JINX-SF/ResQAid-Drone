const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const EmergencyContactSchema = new mongoose.Schema(
  {
    name:         { type: String, trim: true, default: "" },
    phone:        { type: String, trim: true, default: "" },
    relationship: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const MedicalInfoSchema = new mongoose.Schema(
  {
    bloodType:  { type: String, enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], default: "" },
    allergies:  { type: String, trim: true, default: "" },
    conditions: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const SafetySettingsSchema = new mongoose.Schema(
  {
    shareGpsDuringEmergency: { type: Boolean, default: true },
    receiveRescueAlerts:     { type: Boolean, default: true },
  },
  { _id: false }
);

const RecentRequestSchema = new mongoose.Schema(
  {
    type:        { type: String, trim: true, required: true },
    status:      { type: String, enum: ["pending", "in_progress", "completed", "cancelled"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      default: null,
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    googleId:     { type: String, unique: true, sparse: true },
    facebookId:   { type: String, unique: true, sparse: true },
    profileImage: { type: String, default: "" },
    birthday:     { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    phone:    { type: String, trim: true, default: "" },
    phone2:    { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },

    emergencyContact: { type: EmergencyContactSchema, default: () => ({}) },
    medicalInfo:      { type: MedicalInfoSchema,      default: () => ({}) },
    safetySettings:   { type: SafetySettingsSchema,   default: () => ({}) },

    isVerified: { type: Boolean, default: false },

    verifyToken:       { type: String, default: null, select: false },
    verifyTokenExpire: { type: Date,   default: null, select: false },

    resetPasswordToken:  { type: String, default: null, select: false },
    resetPasswordExpire: { type: Date,   default: null, select: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    recentRequests: { type: [RecentRequestSchema], default: [] },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK — hash password before saving
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: async pre-save hooks must NOT declare next as a parameter.
// Mongoose does not pass next to async hooks — it awaits the returned promise.
// Declaring next as a parameter makes it undefined, so calling next() crashes
// with "next is not a function".
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateVerifyToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.verifyToken       = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  return rawToken;
};

UserSchema.methods.generateResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken  = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return rawToken;
};

module.exports = mongoose.model("User", UserSchema);