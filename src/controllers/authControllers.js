const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");

const User = require("../models/User");
const { sendVerifyEmail, sendResetEmail } = require("../services/emailService");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.verifyToken;
  delete userObj.verifyTokenExpire;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  delete userObj.__v;
  return res.status(statusCode).json({ success: true, token, user: userObj });
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER  —  POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are all required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,
      provider: "local",
    });

    const rawToken = user.generateVerifyToken();
    await user.save(); // Hashing and storing in database execution hook

    // 🛠️ FIXED: Moved Socket emission down HERE where the "user" variable actually exists
    try {
      const io = req.app.get("io");
      if (io) io.emit("newUser", user);
    } catch (socketErr) {
      console.warn("⚠️ Socket emit failed:", socketErr.message);
    }

    try {
      await sendVerifyEmail(user.email, user.name, rawToken);
    } catch (emailErr) {
      console.warn("⚠️ Verification email failed:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL  —  GET /api/auth/verify-email/:token
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      verifyToken:       hashedToken,
      verifyTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired",
      });
    }

    user.isVerified      = true;
    user.verifyToken       = null;
    user.verifyTokenExpire = null;
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN  —  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.login = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || "Login failed" });
    return sendTokenResponse(user, 200, res);
  })(req, res, next);
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH
// ─────────────────────────────────────────────────────────────────────────────
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
    const token = signToken(user._id);
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK OAUTH
// ─────────────────────────────────────────────────────────────────────────────
exports.facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
  session: false,
});

exports.facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=facebook_failed`);
    }
    const token = signToken(user._id);
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD  —  POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered you will receive a reset link shortly",
      });
    }
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google or Facebook login — no password to reset",
      });
    }

    const rawToken = user.generateResetToken();
    await user.save();

    try {
      await sendResetEmail(user.email, user.name, rawToken);
    } catch (emailErr) {
      user.resetPasswordToken  = null;
      user.resetPasswordExpire = null;
      await user.save();
      return next(new Error("Email could not be sent"));
    }

    return res.json({
      success: true,
      message: "If that email is registered you will receive a reset link shortly",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD  —  PATCH /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password            = password;
    user.resetPasswordToken  = null;
    user.resetPasswordExpire = null;
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME  —  GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD  —  PATCH /api/auth/change-password
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google or Facebook login — no password to change",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE  —  PUT or PATCH /api/auth/profile
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE  —  PUT or PATCH /api/auth/profile
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    // 🧪 BACKEND DEBUG LOG: Let's see exactly what the server sees after middleware processing
    console.log("--- BACKEND RECEIVED REQ.BODY ---", req.body);
    if (req.file) {
      console.log("--- BACKEND RECEIVED FILE ---", req.file);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fallback to checking req.body or a nested profile object
    const source = (req.body && req.body.profile) ? req.body.profile : (req.body || {});

    // 1. Handle Regular Text Fields (If present, map them; otherwise keep existing)
    if (source.birthday !== undefined) user.birthday = source.birthday === "" || source.birthday === "null" ? null : source.birthday;
    if (source.gender !== undefined) user.gender = source.gender;
    if (source.phone !== undefined) user.phone = source.phone;
    if (source.phone2 !== undefined) user.phone2 = source.phone2;
    if (source.location !== undefined) user.location = source.location;
    
    // Convert text numbers back into real integers safely if they exist
    if (source.height !== undefined) user.height = source.height ? parseInt(source.height, 10) : undefined;
    if (source.weight !== undefined) user.weight = source.weight ? parseInt(source.weight, 10) : undefined;

    // 2. Safely Parse and Update Nested Emergency Contact JSON String
    if (source.emergencyContact !== undefined) {
      try {
        const parsedContact = typeof source.emergencyContact === "string" 
          ? JSON.parse(source.emergencyContact) 
          : source.emergencyContact;

        user.emergencyContact = {
          name: parsedContact.name !== undefined ? parsedContact.name : user.emergencyContact.name,
          phone: parsedContact.phone !== undefined ? parsedContact.phone : user.emergencyContact.phone,
          relationship: parsedContact.relationship !== undefined ? parsedContact.relationship : user.emergencyContact.relationship,
        };
      } catch (e) {
        console.error("⚠️ Failed to parse emergencyContact string:", e.message);
      }
    }

    // 3. Safely Parse and Update Nested Medical Info JSON String
    if (source.medicalInfo !== undefined) {
      try {
        const parsedMedical = typeof source.medicalInfo === "string" 
          ? JSON.parse(source.medicalInfo) 
          : source.medicalInfo;

        user.medicalInfo = {
          bloodType: parsedMedical.bloodType !== undefined ? parsedMedical.bloodType : user.medicalInfo.bloodType,
          allergies: parsedMedical.allergies !== undefined ? parsedMedical.allergies : user.medicalInfo.allergies,
          conditions: parsedMedical.conditions !== undefined ? parsedMedical.conditions : user.medicalInfo.conditions,
        };
      } catch (e) {
        console.error("⚠️ Failed to parse medicalInfo string:", e.message);
      }
    }

    // 4. Handle Uploaded Avatar Image File (If file path mapping is available)
    if (req.file) {
      // If saving to local uploads directory or Cloudinary
      user.profileImage = req.file.path || `/uploads/${req.file.filename}`;
    }

    // Save changes down to your MongoDB instance
    await user.save();

    // 🧪 BACKEND LOG: Verify saved document structural values
    console.log("--- DATABASE SAVED OBJECT ---", user);

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("❌ Profile Update Controller Failed:", err);
    next(err);
  }
};