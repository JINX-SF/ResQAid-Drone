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
  getAllUsers,
  getUserById,
} = require("../controllers/authControllers");

const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

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

router.get("/users", protect,adminOnly, getAllUsers);
router.get("/user/:id", protect,adminOnly, getUserById);

module.exports = router;