const router = require("express").Router();
const ctrl = require("../controllers/missionControllers");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, ctrl.createMission);
router.get("/", protect, ctrl.getMissions);
router.get("/:id", protect, ctrl.getMission);
router.delete("/:id", protect, restrictTo("admin"), ctrl.deleteMission);

router.patch("/:id/assign-drone", protect, ctrl.assignDrone);
router.patch("/:id/assign-survivor", protect, ctrl.assignSurvivor);
router.patch("/:id/status", protect, ctrl.updateMissionStatus);

module.exports = router;