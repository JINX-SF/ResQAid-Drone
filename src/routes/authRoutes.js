const router = require("express").Router();
const multer = require("multer"); // ◄ Add this line

// Configure a basic temporary storage or use your existing avatar upload config
const upload = multer({ dest: "uploads/" }); 

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
  updateProfile, // This is your fixed controller from the previous step
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

// 🛠️ FIXED: Added upload.single("avatar") middleware to parse the multipart FormData fields!
router.patch("/profile", protect, upload.single("avatar"), updateProfile);

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/user/:id", protect, adminOnly, getUserById);

module.exports = router;