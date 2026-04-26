/*const jwt = require("jsonwebtoken");
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

  return res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

/*
exports.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    email = email.toLowerCase().trim();
    name = name.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const user = new User({
      name,
      email,
      password,
      provider: "local",
    });

    const rawToken = user.generateVerifyToken();
    await user.save();

    try {
      await sendVerifyEmail(user.email, user.name, rawToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // ⚠️ IMPORTANT: do NOT pass next here
    try {
      const rawToken = user.generateVerifyToken();
      await user.save();

      await sendVerifyEmail(user.email, user.name, rawToken);
    } catch (emailError) {
      console.warn("Email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Account created. Please verify your email.",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error); // 👈 add this
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      verifyToken: hashedToken,
      verifyTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired",
      });
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpire = null;

    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.login = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }

  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) return next(error);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Login failed",
      });
    }

    return sendTokenResponse(user, 200, res);
  })(req, res, next);
};

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (error, user) => {
    if (error || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }

    const token = signToken(user._id);
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

exports.facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
  session: false,
});

exports.facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", { session: false }, (error, user) => {
    if (error || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=facebook_failed`);
    }

    const token = signToken(user._id);
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
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
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return next(new Error("Email could not be sent"));
    }

    return res.json({
      success: true,
      message: "If that email is registered you will receive a reset link shortly",
    });
  } catch (error) {
    next(error);
  }
};

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
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};


exports.getMe = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

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
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};*/
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

    // Use new User() + save() — NOT User.create()
    // This lets us call generateVerifyToken() BEFORE the first save,
    // so password hashing and token generation happen in ONE save call.
    // Using User.create() then user.save() triggers the pre-save hook TWICE,
    // which causes "next is not a function" from Mongoose's internal kareem hook runner.
    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,
      provider: "local",
    });

    const rawToken = user.generateVerifyToken();

    await user.save(); // one save: hashes password + stores verify token

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

    user.isVerified        = true;
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

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.birthday = req.body.birthday || user.birthday;
    user.gender = req.body.gender || user.gender;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.phone2 = req.body.phone2 || user.phone2;
user.height = req.body.height || user.height;
user.weight = req.body.weight || user.weight;

    user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
    user.medicalInfo = req.body.medicalInfo || user.medicalInfo;

    await user.save();

    res.json({
      success: true,
      user,
    });

  } catch (err) {
    next(err);
  }
};