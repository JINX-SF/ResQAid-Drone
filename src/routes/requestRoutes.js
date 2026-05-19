const router = require("express").Router();
const ctrl = require("../controllers/missionControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");



router.get("/:id", getRequestById);

router.patch("/:id/accept", acceptRequest);

router.patch("/:id/reject", rejectRequest);

module.exports = router;