const router = require("express").Router();

const {
  register,
  verifyEmail,
  login,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
    updateProfile,
} = require("../controllers/authControllers");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookCallback);


router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

router.patch("/profile", protect, updateProfile);

module.exports = router;